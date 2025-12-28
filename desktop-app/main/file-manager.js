const fs = require('fs')
const path = require('path')

const AGENT_TEAM_PATH = '/Users/stevedefendre/Desktop/Agent Team '
const CONTENT_PATH = path.join(AGENT_TEAM_PATH, 'Content')

class FileManager {
  constructor() {
    this.basePath = CONTENT_PATH
  }

  async readContentFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
      return { error: 'Folder not found' }
    }

    const content = {
      path: folderPath,
      blog: null,
      xPost: null,
      linkedinPost: null,
      image: null
    }

    // Read blog post
    const blogPath = path.join(folderPath, 'blog-post.md')
    if (fs.existsSync(blogPath)) {
      content.blog = fs.readFileSync(blogPath, 'utf-8')
    }

    // Read X post
    const xPath = path.join(folderPath, 'x-post.txt')
    if (fs.existsSync(xPath)) {
      content.xPost = fs.readFileSync(xPath, 'utf-8')
    }

    // Read LinkedIn post
    const linkedinPath = path.join(folderPath, 'linkedin-post.txt')
    if (fs.existsSync(linkedinPath)) {
      content.linkedinPost = fs.readFileSync(linkedinPath, 'utf-8')
    }

    // Read image as base64
    const imagePath = path.join(folderPath, 'image.jpg')
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath)
      content.image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    }

    // Also check for PNG
    const imagePngPath = path.join(folderPath, 'image.png')
    if (!content.image && fs.existsSync(imagePngPath)) {
      const imageBuffer = fs.readFileSync(imagePngPath)
      content.image = `data:image/png;base64,${imageBuffer.toString('base64')}`
    }

    return content
  }

  async getContentHistory() {
    if (!fs.existsSync(this.basePath)) {
      return []
    }

    const history = []

    // Get all year-month folders
    const monthFolders = fs.readdirSync(this.basePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && /^\d{4}-\d{2}$/.test(dirent.name))
      .sort((a, b) => b.name.localeCompare(a.name))

    for (const monthFolder of monthFolders) {
      const monthPath = path.join(this.basePath, monthFolder.name)
      const topicFolders = fs.readdirSync(monthPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
          const folderPath = path.join(monthPath, dirent.name)
          const stats = fs.statSync(folderPath)

          // Check what files exist
          const files = {
            blog: fs.existsSync(path.join(folderPath, 'blog-post.md')),
            xPost: fs.existsSync(path.join(folderPath, 'x-post.txt')),
            linkedinPost: fs.existsSync(path.join(folderPath, 'linkedin-post.txt')),
            image: fs.existsSync(path.join(folderPath, 'image.jpg')) ||
                   fs.existsSync(path.join(folderPath, 'image.png'))
          }

          // Try to get title from blog post
          let title = dirent.name.replace(/-/g, ' ')
          const blogPath = path.join(folderPath, 'blog-post.md')
          if (files.blog) {
            try {
              const blogContent = fs.readFileSync(blogPath, 'utf-8')
              const titleMatch = blogContent.match(/title:\s*["']?([^"'\n]+)["']?/i)
              if (titleMatch) {
                title = titleMatch[1]
              }
            } catch (e) {
              // Keep default title
            }
          }

          // Get thumbnail if image exists
          let thumbnail = null
          const imagePath = fs.existsSync(path.join(folderPath, 'image.jpg'))
            ? path.join(folderPath, 'image.jpg')
            : path.join(folderPath, 'image.png')

          if (fs.existsSync(imagePath)) {
            try {
              const imageBuffer = fs.readFileSync(imagePath)
              const ext = imagePath.endsWith('.jpg') ? 'jpeg' : 'png'
              thumbnail = `data:image/${ext};base64,${imageBuffer.toString('base64')}`
            } catch (e) {
              // No thumbnail
            }
          }

          return {
            slug: dirent.name,
            title,
            path: folderPath,
            month: monthFolder.name,
            date: stats.mtime,
            files,
            thumbnail,
            isComplete: files.blog && files.xPost && files.linkedinPost && files.image
          }
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      history.push(...topicFolders)
    }

    return history
  }

  getAgentTeamPath() {
    return AGENT_TEAM_PATH
  }
}

module.exports = { FileManager }
