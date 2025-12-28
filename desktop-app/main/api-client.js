const https = require('https')
const fs = require('fs')
const path = require('path')

class ApiClient {
  constructor(store) {
    this.store = store
  }

  getKeys() {
    return this.store.get('apiKeys', {
      typefully: '',
      nanoBanana: '',
      anthropic: ''
    })
  }

  // Test Typefully API connection
  async testTypefully(apiKey) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.typefully.com',
        path: '/v1/me',
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, message: 'Connected successfully' })
          } else {
            resolve({ success: false, message: `Error: ${res.statusCode}` })
          }
        })
      })

      req.on('error', (e) => {
        resolve({ success: false, message: e.message })
      })

      req.setTimeout(10000, () => {
        req.destroy()
        resolve({ success: false, message: 'Timeout' })
      })

      req.end()
    })
  }

  // Test Nano Banana Pro API
  async testNanoBanana(apiKey) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        contents: [{ parts: [{ text: 'test' }] }]
      })

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, message: 'Connected successfully' })
          } else {
            resolve({ success: false, message: `Error: ${res.statusCode}` })
          }
        })
      })

      req.on('error', (e) => {
        resolve({ success: false, message: e.message })
      })

      req.setTimeout(10000, () => {
        req.destroy()
        resolve({ success: false, message: 'Timeout' })
      })

      req.write(postData)
      req.end()
    })
  }

  // Generate image with Nano Banana Pro
  async generateImage(prompt, apiKey) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        contents: [{
          parts: [{ text: `Generate a professional, modern image for a blog post about: ${prompt}. Style: tech-focused, clean, suitable for social media. Landscape orientation.` }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      })

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/imagen-3.0-generate-002:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            if (res.statusCode === 200 && response.candidates?.[0]?.content?.parts) {
              const imagePart = response.candidates[0].content.parts.find(p => p.inlineData)
              if (imagePart) {
                resolve({ success: true, imageData: imagePart.inlineData.data })
              } else {
                resolve({ success: false, error: 'No image in response' })
              }
            } else {
              resolve({ success: false, error: response.error?.message || 'Failed to generate image' })
            }
          } catch (e) {
            resolve({ success: false, error: 'Invalid response' })
          }
        })
      })

      req.on('error', (e) => resolve({ success: false, error: e.message }))
      req.setTimeout(60000, () => {
        req.destroy()
        resolve({ success: false, error: 'Timeout' })
      })

      req.write(postData)
      req.end()
    })
  }

  // Publish to Typefully
  async publishToTypefully(content, apiKey, platform = 'twitter') {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        content: content,
        schedule: 'next-free-slot',
        threadify: false
      })

      const options = {
        hostname: 'api.typefully.com',
        path: '/v1/drafts/',
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ success: true, message: 'Published successfully' })
          } else {
            resolve({ success: false, message: `Error: ${res.statusCode} - ${data}` })
          }
        })
      })

      req.on('error', (e) => resolve({ success: false, message: e.message }))
      req.setTimeout(30000, () => {
        req.destroy()
        resolve({ success: false, message: 'Timeout' })
      })

      req.write(postData)
      req.end()
    })
  }

  // Generate content using Claude API
  async generateContent(topic, type, apiKey) {
    return new Promise((resolve) => {
      const prompts = {
        blog: `Write a blog post about "${topic}" for DefendreSolutions.com.
          - 800-1000 words
          - Professional, authoritative tone about AI and technology
          - Include an engaging title
          - Use markdown formatting with ## headers
          - End with a call to action
          Just output the blog post content, nothing else.`,
        x: `Write a Twitter/X post about "${topic}" for @sdefendre.
          - Maximum 280 characters
          - Hook first, be punchy
          - End with → DefendreSolutions.com
          - No hashtags
          Just output the post text, nothing else.`,
        linkedin: `Write a LinkedIn post about "${topic}" for Steve Defendre.
          - 800-1200 characters
          - Professional storytelling tone
          - End with an engaging question
          - Add 3-4 relevant hashtags at the bottom
          Just output the post text, nothing else.`
      }

      const postData = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompts[type]
        }]
      })

      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            if (res.statusCode === 200 && response.content?.[0]?.text) {
              resolve({ success: true, content: response.content[0].text })
            } else {
              resolve({ success: false, error: response.error?.message || `Error: ${res.statusCode}` })
            }
          } catch (e) {
            resolve({ success: false, error: 'Invalid response' })
          }
        })
      })

      req.on('error', (e) => resolve({ success: false, error: e.message }))
      req.setTimeout(60000, () => {
        req.destroy()
        resolve({ success: false, error: 'Timeout' })
      })

      req.write(postData)
      req.end()
    })
  }

  // Save content to file
  saveContent(folderPath, filename, content) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(path.join(folderPath, filename), content)
  }

  // Save image to file
  saveImage(folderPath, filename, base64Data) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(path.join(folderPath, filename), buffer)
  }
}

module.exports = { ApiClient }
