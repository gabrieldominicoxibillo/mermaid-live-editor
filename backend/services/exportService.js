const mermaidService = require('./mermaidService');
const config = require('../config/config');

/**
 * Export service for handling diagram exports with quality presets
 */
class ExportService {
  /**
   * Export diagram with specified options
   * @param {string} mermaidCode - The Mermaid diagram code
   * @param {Object} options - Export options
   * @returns {Promise<{success: boolean, data: string, filename: string, contentType: string, size: number}>}
   */
  async exportDiagram(mermaidCode, options = {}) {
    const {
      format = 'png',
      quality = 'high',
      scale = 1,
      theme = config.DEFAULT_THEME,
      filename = 'diagram'
    } = options;

    // Validate inputs
    this.validateExportOptions(format, quality, theme);

    // Get quality settings
    const qualitySettings = config.QUALITY_PRESETS[quality];
    if (!qualitySettings) {
      throw new Error(`Invalid quality preset: ${quality}`);
    }

    // Build render options
    const renderOptions = {
      format,
      theme,
      width: qualitySettings.width,
      height: qualitySettings.height,
      scale: qualitySettings.scale * scale
    };

    try {
      // Render the diagram
      const result = await mermaidService.renderDiagram(mermaidCode, renderOptions);

      if (!result.success) {
        throw new Error('Rendering failed');
      }

      // Calculate file size
      const buffer = Buffer.from(result.data, 'base64');
      const fileSize = buffer.length;

      // Generate filename with timestamp for uniqueness
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const finalFilename = `${filename}-${timestamp}.${format}`;

      return {
        success: true,
        data: result.data,
        filename: finalFilename,
        contentType: result.contentType,
        size: fileSize,
        metadata: {
          format,
          quality,
          theme,
          dimensions: `${renderOptions.width}x${renderOptions.height}`,
          scale: renderOptions.scale,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Get export presets information
   */
  getExportPresets() {
    return {
      formats: config.SUPPORTED_FORMATS,
      themes: config.SUPPORTED_THEMES,
      qualityPresets: Object.keys(config.QUALITY_PRESETS).map(key => ({
        name: key,
        ...config.QUALITY_PRESETS[key],
        description: this.getQualityDescription(key)
      }))
    };
  }

  /**
   * Batch export - export diagram in multiple formats/qualities
   * @param {string} mermaidCode - The Mermaid diagram code
   * @param {Array} exportConfigs - Array of export configurations
   * @returns {Promise<Array>}
   */
  async batchExport(mermaidCode, exportConfigs) {
    const results = [];

    for (const config of exportConfigs) {
      try {
        const result = await this.exportDiagram(mermaidCode, config);
        results.push({ ...result, config });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          config
        });
      }
    }

    return results;
  }

  /**
   * Validate export options
   * @private
   */
  validateExportOptions(format, quality, theme) {
    if (!config.SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported format: ${format}. Supported: ${config.SUPPORTED_FORMATS.join(', ')}`);
    }

    if (!config.QUALITY_PRESETS[quality]) {
      throw new Error(`Invalid quality preset: ${quality}. Available: ${Object.keys(config.QUALITY_PRESETS).join(', ')}`);
    }

    if (!config.SUPPORTED_THEMES.includes(theme)) {
      throw new Error(`Unsupported theme: ${theme}. Supported: ${config.SUPPORTED_THEMES.join(', ')}`);
    }
  }

  /**
   * Get quality description
   * @private
   */
  getQualityDescription(quality) {
    const descriptions = {
      low: 'Small file size, good for web preview',
      medium: 'Balanced size and quality',
      high: 'High quality for presentations',
      ultra: '4K quality for print and detailed viewing'
    };

    return descriptions[quality] || 'Custom quality setting';
  }

  /**
   * Estimate file size before export
   */
  estimateFileSize(format, quality) {
    const baseSizes = {
      svg: { low: 5, medium: 15, high: 30, ultra: 60 }, // KB
      png: { low: 50, medium: 200, high: 800, ultra: 3000 }, // KB
      pdf: { low: 20, medium: 100, high: 400, ultra: 1500 } // KB
    };

    const estimate = baseSizes[format]?.[quality] || 100;
    return {
      estimated: estimate,
      unit: 'KB',
      note: 'Actual size may vary based on diagram complexity'
    };
  }
}

module.exports = new ExportService();
