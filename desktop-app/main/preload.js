const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('agentTeam', {
  // API Key Management
  getApiKeys: () => ipcRenderer.invoke('settings:getKeys'),
  saveApiKeys: (keys) => ipcRenderer.invoke('settings:saveKeys', keys),
  testTypefully: (apiKey) => ipcRenderer.invoke('settings:testTypefully', apiKey),
  testNanoBanana: (apiKey) => ipcRenderer.invoke('settings:testNanoBanana', apiKey),
  testAnthropic: (apiKey) => ipcRenderer.invoke('settings:testAnthropic', apiKey),

  // Content Generation (Direct API calls)
  generateAll: (topic, platforms) => ipcRenderer.invoke('generate:all', { topic, platforms }),
  generateContent: (topic, type) => ipcRenderer.invoke('generate:content', { topic, type }),
  generateImage: (topic) => ipcRenderer.invoke('generate:image', { topic }),

  // Progress events
  onProgress: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('generate:progress', handler)
    return () => ipcRenderer.removeListener('generate:progress', handler)
  },

  // Publishing
  publishPost: (content, platform) => ipcRenderer.invoke('publish:post', { content, platform }),

  // File operations
  openFolder: (folderPath) => ipcRenderer.invoke('files:openFolder', folderPath),
  getHistory: () => ipcRenderer.invoke('files:getHistory'),
  loadContent: (folderPath) => ipcRenderer.invoke('files:loadContent', folderPath),

  // System
  getPlatform: () => process.platform
})
