const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');

/**
 * Export API Routes
 * Handles diagram export, download, and batch operations
 */

// Download diagram as file
router.post('/download', async (req, res) => {
  try {
    const { code, options = {} } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'No diagram code provided'
      });
    }

    const result = await exportService.exportDiagram(code, options);

    if (!result.success) {
      return res.status(500).json({ error: 'Export failed' });
    }

    const buffer = Buffer.from(result.data, 'base64');

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('X-Export-Metadata', JSON.stringify(result.metadata));

    res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get export presets and options
router.get('/presets', (req, res) => {
  try {
    const presets = exportService.getExportPresets();
    res.json(presets);
  } catch (error) {
    console.error('Error getting presets:', error);
    res.status(500).json({ error: 'Failed to get export presets' });
  }
});

// Estimate file size before export
router.post('/estimate', (req, res) => {
  try {
    const { format = 'png', quality = 'high' } = req.body;
    const estimate = exportService.estimateFileSize(format, quality);
    res.json(estimate);
  } catch (error) {
    console.error('Estimation error:', error);
    res.status(500).json({ error: 'Failed to estimate file size' });
  }
});

// Batch export (multiple formats/qualities)
router.post('/batch', async (req, res) => {
  try {
    const { code, configs } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No diagram code provided' });
    }

    if (!configs || !Array.isArray(configs)) {
      return res.status(400).json({ error: 'Export configurations required' });
    }

    const results = await exportService.batchExport(code, configs);
    res.json({ results });
  } catch (error) {
    console.error('Batch export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Preview export (returns base64 data for preview)
router.post('/preview', async (req, res) => {
  try {
    const { code, options = {} } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'No diagram code provided'
      });
    }

    // Force SVG format for preview
    const previewOptions = { ...options, format: 'svg' };
    const result = await exportService.exportDiagram(code, previewOptions);

    if (!result.success) {
      return res.status(500).json({ error: 'Preview generation failed' });
    }

    res.json({
      success: true,
      data: result.data,
      contentType: result.contentType,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
