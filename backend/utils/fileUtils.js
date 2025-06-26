const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

/**
 * File utility functions for handling temporary files and directories
 */
class FileUtils {
  /**
   * Create temporary directory if it doesn't exist
   */
  static async createTempDirectory() {
    try {
      await fs.mkdir(config.TEMP_DIR, { recursive: true });
      console.log(`📁 Temp directory created: ${config.TEMP_DIR}`);
    } catch (error) {
      console.error('❌ Error creating temp directory:', error);
      throw error;
    }
  }

  /**
   * Clean up old temporary files (older than 1 hour)
   */
  static async cleanupTempFiles() {
    try {
      const files = await fs.readdir(config.TEMP_DIR);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const file of files) {
        try {
          const filePath = path.join(config.TEMP_DIR, file);
          const stats = await fs.stat(filePath);

          if (now - stats.mtime.getTime() > oneHour) {
            await fs.unlink(filePath);
            console.log(`🗑️ Cleaned up old temp file: ${file}`);
          }
        } catch (error) {
          // Skip files that can't be processed
          console.warn(`⚠️ Could not process temp file ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.error('⚠️ Error cleaning temp files:', error);
    }
  }

  /**
   * Generate unique filename with extension
   */
  static generateUniqueFilename(extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `mermaid-${timestamp}-${random}.${extension}`;
  }

  /**
   * Safely delete file with error handling
   */
  static async safeDelete(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, which is fine
      if (error.code !== 'ENOENT') {
        console.error(`⚠️ Error deleting file ${filePath}:`, error.message);
      }
    }
  }
}

// Auto-cleanup temp files every hour
setInterval(() => {
  FileUtils.cleanupTempFiles();
}, 60 * 60 * 1000);

module.exports = FileUtils;
