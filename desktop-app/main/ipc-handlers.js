const { ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const { ApiClient } = require('./api-client')

// Initialize store with environment variables as defaults
const getEnvKey = (key) => process.env[key] || ''

const store = new Store({
  defaults: {
    apiKeys: {
      typefully: getEnvKey('TYPEFULLY_API_KEY'),
      nanoBanana: getEnvKey('GEMINI_API_KEY') || getEnvKey('NANO_BANANA_API_KEY'),
      anthropic: getEnvKey('ANTHROPIC_API_KEY')
    }
  }
})

// On first run, try to load from environment variables if store is empty
const savedKeys = store.get('apiKeys')
if (!savedKeys.typefully && !savedKeys.nanoBanana && !savedKeys.anthropic) {
  const envKeys = {
    typefully: getEnvKey('TYPEFULLY_API_KEY'),
    nanoBanana: getEnvKey('GEMINI_API_KEY') || getEnvKey('NANO_BANANA_API_KEY'),
    anthropic: getEnvKey('ANTHROPIC_API_KEY')
  }
  if (envKeys.typefully || envKeys.nanoBanana || envKeys.anthropic) {
    store.set('apiKeys', envKeys)
  }
}

const apiClient = new ApiClient(store)
const CONTENT_BASE = '/Users/stevedefendre/Desktop/Agent Team /Content'

function setupIpcHandlers(mainWindow) {

  // API Key Management
  ipcMain.handle('settings:getKeys', () => {
    return store.get('apiKeys')
  })

  ipcMain.handle('settings:saveKeys', (_, keys) => {
    store.set('apiKeys', keys)
    return { success: true }
  })

  ipcMain.handle('settings:testTypefully', async (_, apiKey) => {
    return await apiClient.testTypefully(apiKey)
  })

  ipcMain.handle('settings:testNanoBanana', async (_, apiKey) => {
    return await apiClient.testNanoBanana(apiKey)
  })

  ipcMain.handle('settings:testAnthropic', async (_, apiKey) => {
    // Quick test by generating short content
    const result = await apiClient.generateContent('test', 'x', apiKey)
    if (result.success) {
      return { success: true, message: 'Connected successfully' }
    }
    return { success: false, message: result.error }
  })

  // Content Generation
  ipcMain.handle('generate:content', async (event, { topic, type }) => {
    const keys = store.get('apiKeys')
    if (!keys.anthropic) {
      return { success: false, error: 'Anthropic API key not set' }
    }

    mainWindow.webContents.send('generate:progress', { step: type, status: 'generating' })
    const result = await apiClient.generateContent(topic, type, keys.anthropic)
    mainWindow.webContents.send('generate:progress', { step: type, status: result.success ? 'done' : 'error' })

    return result
  })

  ipcMain.handle('generate:image', async (event, { topic }) => {
    const keys = store.get('apiKeys')
    if (!keys.nanoBanana) {
      return { success: false, error: 'Nano Banana API key not set' }
    }

    mainWindow.webContents.send('generate:progress', { step: 'image', status: 'generating' })
    const result = await apiClient.generateImage(topic, keys.nanoBanana)
    mainWindow.webContents.send('generate:progress', { step: 'image', status: result.success ? 'done' : 'error' })

    return result
  })

  // Full generation workflow
  ipcMain.handle('generate:all', async (event, { topic, platforms }) => {
    const keys = store.get('apiKeys')

    if (!keys.anthropic) {
      return { success: false, error: 'Anthropic API key required' }
    }

    const results = {
      blog: null,
      x: null,
      linkedin: null,
      image: null
    }

    // Create folder
    const now = new Date()
    const monthFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)
    const folderPath = path.join(CONTENT_BASE, monthFolder, slug)

    try {
      // Generate blog
      mainWindow.webContents.send('generate:progress', { step: 'blog', status: 'generating' })
      const blogResult = await apiClient.generateContent(topic, 'blog', keys.anthropic)
      if (blogResult.success) {
        results.blog = blogResult.content
        apiClient.saveContent(folderPath, 'blog-post.md', blogResult.content)
        mainWindow.webContents.send('generate:progress', { step: 'blog', status: 'done' })
      } else {
        mainWindow.webContents.send('generate:progress', { step: 'blog', status: 'error' })
        return { success: false, error: `Blog: ${blogResult.error}` }
      }

      // Generate X post if selected
      if (platforms.includes('x')) {
        mainWindow.webContents.send('generate:progress', { step: 'x', status: 'generating' })
        const xResult = await apiClient.generateContent(topic, 'x', keys.anthropic)
        if (xResult.success) {
          results.x = xResult.content
          apiClient.saveContent(folderPath, 'x-post.txt', xResult.content)
          mainWindow.webContents.send('generate:progress', { step: 'x', status: 'done' })
        } else {
          mainWindow.webContents.send('generate:progress', { step: 'x', status: 'error' })
        }
      }

      // Generate LinkedIn post if selected
      if (platforms.includes('linkedin')) {
        mainWindow.webContents.send('generate:progress', { step: 'linkedin', status: 'generating' })
        const liResult = await apiClient.generateContent(topic, 'linkedin', keys.anthropic)
        if (liResult.success) {
          results.linkedin = liResult.content
          apiClient.saveContent(folderPath, 'linkedin-post.txt', liResult.content)
          mainWindow.webContents.send('generate:progress', { step: 'linkedin', status: 'done' })
        } else {
          mainWindow.webContents.send('generate:progress', { step: 'linkedin', status: 'error' })
        }
      }

      // Generate image if API key available
      if (keys.nanoBanana) {
        mainWindow.webContents.send('generate:progress', { step: 'image', status: 'generating' })
        const imgResult = await apiClient.generateImage(topic, keys.nanoBanana)
        if (imgResult.success) {
          results.image = `data:image/png;base64,${imgResult.imageData}`
          apiClient.saveImage(folderPath, 'image.png', imgResult.imageData)
          mainWindow.webContents.send('generate:progress', { step: 'image', status: 'done' })
        } else {
          mainWindow.webContents.send('generate:progress', { step: 'image', status: 'error' })
        }
      }

      mainWindow.webContents.send('generate:progress', { step: 'complete', status: 'done' })

      return {
        success: true,
        results,
        folderPath
      }

    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Publishing
  ipcMain.handle('publish:post', async (event, { content, platform }) => {
    const keys = store.get('apiKeys')
    if (!keys.typefully) {
      return { success: false, error: 'Typefully API key not set' }
    }
    return await apiClient.publishToTypefully(content, keys.typefully, platform)
  })

  // File operations
  ipcMain.handle('files:openFolder', (_, folderPath) => {
    shell.openPath(folderPath)
    return { success: true }
  })

  ipcMain.handle('files:getHistory', () => {
    const history = []
    if (!fs.existsSync(CONTENT_BASE)) return history

    const months = fs.readdirSync(CONTENT_BASE, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d{4}-\d{2}$/.test(d.name))
      .sort((a, b) => b.name.localeCompare(a.name))

    for (const month of months) {
      const monthPath = path.join(CONTENT_BASE, month.name)
      const topics = fs.readdirSync(monthPath, { withFileTypes: true })
        .filter(d => d.isDirectory())

      for (const topic of topics) {
        const topicPath = path.join(monthPath, topic.name)
        history.push({
          slug: topic.name,
          title: topic.name.replace(/-/g, ' '),
          path: topicPath,
          month: month.name
        })
      }
    }
    return history
  })

  ipcMain.handle('files:loadContent', (_, folderPath) => {
    const content = {}

    const blogPath = path.join(folderPath, 'blog-post.md')
    if (fs.existsSync(blogPath)) content.blog = fs.readFileSync(blogPath, 'utf-8')

    const xPath = path.join(folderPath, 'x-post.txt')
    if (fs.existsSync(xPath)) content.x = fs.readFileSync(xPath, 'utf-8')

    const liPath = path.join(folderPath, 'linkedin-post.txt')
    if (fs.existsSync(liPath)) content.linkedin = fs.readFileSync(liPath, 'utf-8')

    const imgPath = path.join(folderPath, 'image.png')
    const imgPathJpg = path.join(folderPath, 'image.jpg')
    if (fs.existsSync(imgPath)) {
      content.image = `data:image/png;base64,${fs.readFileSync(imgPath).toString('base64')}`
    } else if (fs.existsSync(imgPathJpg)) {
      content.image = `data:image/jpeg;base64,${fs.readFileSync(imgPathJpg).toString('base64')}`
    }

    return content
  })
}

module.exports = { setupIpcHandlers }
