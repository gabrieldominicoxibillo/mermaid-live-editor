const express = require('express');
const router = express.Router();
const mermaidService = require('../services/mermaidService');

/**
 * Diagram API Routes
 * Handles validation, rendering, and diagram information
 */

// Validate diagram syntax
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        error: 'No diagram code provided'
      });
    }

    const result = await mermaidService.validateDiagram(code);
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Validation service error'
    });
  }
});

// Render diagram for preview
router.post('/render', async (req, res) => {
  try {
    const { code, options = {} } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'No diagram code provided'
      });
    }

    const result = await mermaidService.renderDiagram(code, options);
    res.json(result);
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported diagram types
router.get('/types', (req, res) => {
  try {
    const types = mermaidService.getSupportedDiagramTypes();
    res.json({ types });
  } catch (error) {
    console.error('Error getting diagram types:', error);
    res.status(500).json({ error: 'Failed to get diagram types' });
  }
});

// Get example diagram
router.get('/example/:type?', (req, res) => {
  try {
    const { type = 'flowchart' } = req.params;
    const example = mermaidService.getExampleDiagram(type);
    res.json({ type, example });
  } catch (error) {
    console.error('Error getting example:', error);
    res.status(500).json({ error: 'Failed to get example diagram' });
  }
});

// Quick validation endpoint (lighter weight)
router.post('/quick-validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim().length === 0) {
      return res.json({ valid: false, error: 'Empty diagram' });
    }

    // Basic syntax checks before full validation
    const basicChecks = {
      hasValidStart: /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey|gitgraph|requirement|mindmap|timeline)/i.test(code.trim()),
      hasContent: code.trim().split('\n').length > 1,
      noSuspiciousCharacters: !/[<>{}]/.test(code) || /-->|---|\.\.\./.test(code)
    };

    if (!basicChecks.hasValidStart) {
      return res.json({
        valid: false,
        error: 'Invalid diagram type or missing diagram declaration'
      });
    }

    // If basic checks pass, do full validation
    const result = await mermaidService.validateDiagram(code);
    res.json(result);
  } catch (error) {
    console.error('Quick validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Validation service error'
    });
  }
});

module.exports = router;
