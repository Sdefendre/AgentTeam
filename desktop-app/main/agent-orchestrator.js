const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// Progress detection patterns
const PROGRESS_PATTERNS = {
  research: /researching|web search|gathering|searching/i,
  blog: /writing blog|blog post|800.*words|1500.*words|markdown/i,
  image: /generating image|nano.*banana|image\.jpg|ai.*image/i,
  x: /adapting.*x|twitter|x-post|tweet/i,
  linkedin: /adapting.*linkedin|linkedin.*post/i,
  publish: /publishing|typefully|python3.*publish/i,
  complete: /complete|finished|done|quality checklist/i
}

// Step order for progress calculation
const STEP_ORDER = ['research', 'blog', 'image', 'x', 'linkedin', 'publish', 'complete']

class AgentOrchestrator {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.process = null
    this.currentStep = null
    this.completedSteps = new Set()
    this.agentTeamPath = '/Users/stevedefendre/Desktop/Agent Team '
  }

  formatPrompt(topic, settings) {
    const config = {
      blog_length: settings.blogLength || 1200,
      image_style: settings.imageStyle || 'professional',
      tone: settings.tone || 'authoritative',
      platforms: settings.platforms || ['x', 'linkedin'],
      schedule: settings.schedule || 'next-free-slot',
      hashtag_count: settings.hashtagCount || 4,
      cta_text: settings.ctaText || 'DefendreSolutions.com',
      quick_mode: settings.quickMode !== false // Default to true for speed
    }

    const modeInstruction = config.quick_mode
      ? 'QUICK MODE ENABLED: Skip web research entirely. Use your existing knowledge to write content immediately. Do NOT use web search tools. Go directly to writing.'
      : 'Deep research mode: Use web search to gather current information before writing.'

    return `[AGENT_CONFIG]
${JSON.stringify(config, null, 2)}
[/AGENT_CONFIG]

${modeInstruction}

Write about ${topic}`
  }

  start(topic, settings) {
    if (this.process) {
      this.cancel()
    }

    this.currentStep = null
    this.completedSteps = new Set()

    const prompt = this.formatPrompt(topic, settings)

    // Spawn Claude CLI
    this.process = spawn('claude', [
      '--agent', 'social-media-manager',
      '--dangerously-skip-permissions',
      prompt
    ], {
      cwd: this.agentTeamPath,
      shell: true,
      env: {
        ...process.env,
        // Pass settings as env vars as backup
        BLOG_LENGTH: String(settings.blogLength || 1200),
        IMAGE_STYLE: settings.imageStyle || 'professional',
        TONE: settings.tone || 'authoritative'
      }
    })

    // Handle stdout
    this.process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          this.parseLine(line)
          this.mainWindow.webContents.send('agent:output', {
            line: line.trim(),
            timestamp: Date.now()
          })
        }
      })
    })

    // Handle stderr
    this.process.stderr.on('data', (data) => {
      const line = data.toString().trim()
      if (line) {
        this.mainWindow.webContents.send('agent:output', {
          line: `[stderr] ${line}`,
          timestamp: Date.now()
        })
      }
    })

    // Handle process close
    this.process.on('close', (code) => {
      if (code === 0 || this.completedSteps.size > 0) {
        const contentFolder = this.detectContentFolder()
        this.mainWindow.webContents.send('agent:complete', {
          success: true,
          contentFolder,
          files: this.getGeneratedFiles(contentFolder)
        })
      } else {
        this.mainWindow.webContents.send('agent:error', {
          message: `Agent process exited with code ${code}`
        })
      }
      this.process = null
    })

    // Handle process error
    this.process.on('error', (error) => {
      this.mainWindow.webContents.send('agent:error', {
        message: error.message
      })
      this.process = null
    })

    return true
  }

  parseLine(line) {
    // Check for explicit progress markers first
    const markerMatch = line.match(/\[PROGRESS:(\w+)\]/i)
    if (markerMatch) {
      const step = markerMatch[1].toLowerCase()
      this.updateProgress(step)
      return
    }

    // Fall back to pattern matching
    for (const [step, pattern] of Object.entries(PROGRESS_PATTERNS)) {
      if (pattern.test(line)) {
        this.updateProgress(step)
        return
      }
    }
  }

  updateProgress(step) {
    if (step === this.currentStep) return

    // Mark previous step as complete
    if (this.currentStep && this.currentStep !== 'complete') {
      this.completedSteps.add(this.currentStep)
    }

    this.currentStep = step

    if (step === 'complete') {
      this.completedSteps.add('publish')
    }

    const percentage = this.calculatePercentage()

    this.mainWindow.webContents.send('agent:progress', {
      step,
      status: step === 'complete' ? 'complete' : 'in_progress',
      percentage,
      completedSteps: Array.from(this.completedSteps)
    })
  }

  calculatePercentage() {
    const stepIndex = STEP_ORDER.indexOf(this.currentStep)
    if (stepIndex === -1) return 0
    if (this.currentStep === 'complete') return 100
    return Math.round(((stepIndex + 0.5) / (STEP_ORDER.length - 1)) * 100)
  }

  detectContentFolder() {
    // Get current date for folder path
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const contentBase = path.join(this.agentTeamPath, 'Content', yearMonth)

    if (!fs.existsSync(contentBase)) {
      return null
    }

    // Find the most recently modified folder
    const folders = fs.readdirSync(contentBase, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(contentBase, dirent.name),
        mtime: fs.statSync(path.join(contentBase, dirent.name)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime)

    return folders.length > 0 ? folders[0].path : null
  }

  getGeneratedFiles(folderPath) {
    if (!folderPath || !fs.existsSync(folderPath)) {
      return []
    }

    const expectedFiles = ['blog-post.md', 'x-post.txt', 'linkedin-post.txt', 'image.jpg']
    return expectedFiles.filter(file =>
      fs.existsSync(path.join(folderPath, file))
    )
  }

  cancel() {
    if (this.process) {
      this.process.kill('SIGTERM')
      this.process = null
      this.mainWindow.webContents.send('agent:error', {
        message: 'Agent cancelled by user'
      })
    }
  }

  isRunning() {
    return this.process !== null
  }
}

module.exports = { AgentOrchestrator }
