const path = require('path');

const config = {
  // Server configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // File handling
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  TEMP_DIR: process.env.TEMP_DIR || path.join(__dirname, '../temp'),

  // Mermaid configuration
  DEFAULT_THEME: 'default',
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  DEFAULT_SCALE: 1,

  // Export quality presets
  QUALITY_PRESETS: {
    low: { width: 800, height: 600, scale: 1 },
    medium: { width: 1200, height: 800, scale: 1.5 },
    high: { width: 1920, height: 1080, scale: 2 },
    ultra: { width: 3840, height: 2160, scale: 3 }
  },

  // Supported formats
  SUPPORTED_FORMATS: ['svg', 'png', 'pdf'],
  SUPPORTED_THEMES: ['default', 'dark', 'forest', 'neutral'],

  // Content types mapping
  CONTENT_TYPES: {
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'pdf': 'application/pdf'
  },

  // Puppeteer configuration
  PUPPETEER_CONFIG: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  },

  // Render timeout
  RENDER_TIMEOUT: parseInt(process.env.RENDER_TIMEOUT) || 30000
};

module.exports = config;
