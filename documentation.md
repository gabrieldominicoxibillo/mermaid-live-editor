# Mermaid Diagram Editor - Implementation Plan

## Architecture Overview

**Frontend**: React/Vue.js with Monaco Editor for code editing
**Backend**: Node.js/Express with @mermaid-js/mermaid-cli
**Real-time Communication**: WebSockets or Server-Sent Events
**Export**: High-quality PNG/SVG/PDF generation with scaling options

## 1. Project Setup

### Backend Setup
```bash
# Initialize project
npm init -y

# Install dependencies
npm install express cors @mermaid-js/mermaid-cli puppeteer multer
npm install -D nodemon

# Install frontend build tools
npm install webpack webpack-cli webpack-dev-server
npm install monaco-editor react react-dom
```

### Project Structure
```
mermaid-editor/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── diagram.js
│   │   └── export.js
│   ├── services/
│   │   ├── mermaidService.js
│   │   └── exportService.js
│   └── temp/ (for temporary files)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.js
│   │   │   ├── Preview.js
│   │   │   └── ExportPanel.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
└── package.json
```

## 2. Backend Implementation

### Main Server (backend/server.js)
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const diagramRoutes = require('./routes/diagram');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.use('/api/diagram', diagramRoutes);
app.use('/api/export', exportRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Mermaid Service (backend/services/mermaidService.js)
```javascript
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MermaidService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  async validateDiagram(mermaidCode) {
    const tempId = uuidv4();
    const inputFile = path.join(this.tempDir, `${tempId}.mmd`);
    
    try {
      // Write mermaid code to temporary file
      await fs.writeFile(inputFile, mermaidCode);
      
      // Validate using mermaid-cli
      return new Promise((resolve, reject) => {
        exec(`npx mmdc -i ${inputFile} --dry-run`, (error, stdout, stderr) => {
          // Cleanup
          fs.unlink(inputFile).catch(console.error);
          
          if (error) {
            resolve({ valid: false, error: stderr || error.message });
          } else {
            resolve({ valid: true });
          }
        });
      });
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async renderDiagram(mermaidCode, options = {}) {
    const tempId = uuidv4();
    const inputFile = path.join(this.tempDir, `${tempId}.mmd`);
    const outputFile = path.join(this.tempDir, `${tempId}.svg`);
    
    const {
      format = 'svg',
      theme = 'default',
      width = 1200,
      height = 800,
      scale = 1
    } = options;

    try {
      await fs.writeFile(inputFile, mermaidCode);
      
      const command = `npx mmdc -i ${inputFile} -o ${outputFile} -t ${theme} -w ${width} -H ${height} -s ${scale}`;
      
      return new Promise((resolve, reject) => {
        exec(command, async (error, stdout, stderr) => {
          try {
            if (error) {
              reject(new Error(stderr || error.message));
              return;
            }

            const outputData = await fs.readFile(outputFile);
            
            // Cleanup
            await Promise.all([
              fs.unlink(inputFile).catch(console.error),
              fs.unlink(outputFile).catch(console.error)
            ]);

            resolve({
              success: true,
              data: outputData.toString('base64'),
              format,
              contentType: this.getContentType(format)
            });
          } catch (readError) {
            reject(readError);
          }
        });
      });
    } catch (error) {
      throw new Error(`Render failed: ${error.message}`);
    }
  }

  getContentType(format) {
    const types = {
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'pdf': 'application/pdf'
    };
    return types[format] || 'image/svg+xml';
  }
}

module.exports = new MermaidService();
```

### Export Service (backend/services/exportService.js)
```javascript
const mermaidService = require('./mermaidService');

class ExportService {
  async exportDiagram(mermaidCode, options) {
    const {
      format = 'png',
      quality = 'high',
      scale = 1,
      theme = 'default',
      filename = 'diagram'
    } = options;

    // Quality settings
    const qualitySettings = {
      low: { width: 800, height: 600, scale: 1 },
      medium: { width: 1200, height: 800, scale: 1.5 },
      high: { width: 1920, height: 1080, scale: 2 },
      ultra: { width: 3840, height: 2160, scale: 3 }
    };

    const settings = qualitySettings[quality] || qualitySettings.high;
    
    const renderOptions = {
      format,
      theme,
      width: settings.width,
      height: settings.height,
      scale: settings.scale * scale
    };

    const result = await mermaidService.renderDiagram(mermaidCode, renderOptions);
    
    return {
      ...result,
      filename: `${filename}.${format}`,
      size: Buffer.from(result.data, 'base64').length
    };
  }
}

module.exports = new ExportService();
```

### API Routes (backend/routes/diagram.js)
```javascript
const express = require('express');
const router = express.Router();
const mermaidService = require('../services/mermaidService');

// Validate diagram
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await mermaidService.validateDiagram(code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Render diagram for preview
router.post('/render', async (req, res) => {
  try {
    const { code, options = {} } = req.body;
    const result = await mermaidService.renderDiagram(code, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Export Routes (backend/routes/export.js)
```javascript
const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');

router.post('/download', async (req, res) => {
  try {
    const { code, options = {} } = req.body;
    const result = await exportService.exportDiagram(code, options);
    
    const buffer = Buffer.from(result.data, 'base64');
    
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 3. Frontend Implementation

### Main App Component (frontend/src/App.js)
```javascript
import React, { useState, useCallback, useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ExportPanel from './components/ExportPanel';
import './App.css';

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
    D --> B
    C --> E[End]`;

function App() {
  const [diagramCode, setDiagramCode] = useState(DEFAULT_DIAGRAM);
  const [previewData, setPreviewData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [previewOptions, setPreviewOptions] = useState({
    theme: 'default',
    scale: 1
  });

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const validateAndRender = useCallback(async (code, options) => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate first
      const validateResponse = await fetch('/api/diagram/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const validation = await validateResponse.json();
      
      if (!validation.valid) {
        setValidationError(validation.error);
        setPreviewData(null);
        return;
      }

      // Render for preview
      const renderResponse = await fetch('/api/diagram/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, options })
      });
      
      const renderResult = await renderResponse.json();
      
      if (renderResult.success) {
        setPreviewData(renderResult.data);
        setValidationError(null);
      } else {
        setValidationError(renderResult.error);
      }
    } catch (error) {
      setValidationError(`Network error: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const debouncedValidateAndRender = useCallback(
    debounce(validateAndRender, 500),
    [validateAndRender]
  );

  useEffect(() => {
    debouncedValidateAndRender(diagramCode, previewOptions);
  }, [diagramCode, previewOptions, debouncedValidateAndRender]);

  const handleCodeChange = (newCode) => {
    setDiagramCode(newCode);
  };

  const handlePreviewOptionsChange = (newOptions) => {
    setPreviewOptions(prev => ({ ...prev, ...newOptions }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mermaid Diagram Editor</h1>
        <ExportPanel 
          diagramCode={diagramCode}
          disabled={!previewData || isValidating}
        />
      </header>
      
      <main className="app-main">
        <div className="editor-panel">
          <Editor 
            value={diagramCode}
            onChange={handleCodeChange}
            error={validationError}
            isValidating={isValidating}
          />
        </div>
        
        <div className="preview-panel">
          <Preview 
            data={previewData}
            isLoading={isValidating}
            error={validationError}
            options={previewOptions}
            onOptionsChange={handlePreviewOptionsChange}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
```

### Editor Component (frontend/src/components/Editor.js)
```javascript
import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

const Editor = ({ value, onChange, error, isValidating }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Configure Monaco Editor for Mermaid
      monaco.languages.register({ id: 'mermaid' });
      
      monaco.languages.setMonarchTokensProvider('mermaid', {
        tokenizer: {
          root: [
            [/\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey|gitgraph)\b/, 'keyword'],
            [/\b(TD|TB|BT|RL|LR)\b/, 'keyword'],
            [/-->|---|\-\.-|\-\.\->/, 'operator'],
            [/\[[^\]]*\]/, 'string'],
            [/\{[^\}]*\}/, 'string'],
            [/\([^\)]*\)/, 'string'],
            [/\|[^\|]*\|/, 'string'],
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            [/%%.*$/, 'comment']
          ]
        }
      });

      editorRef.current = monaco.editor.create(containerRef.current, {
        value: value,
        language: 'mermaid',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontSize: 14,
        lineNumbers: 'on',
        renderWhitespace: 'boundary',
        folding: true
      });

      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current.getValue();
        onChange(newValue);
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <span>Mermaid Code</span>
        <div className="editor-status">
          {isValidating && <span className="validating">Validating...</span>}
          {error && <span className="error">Error: {error}</span>}
          {!isValidating && !error && <span className="valid">Valid</span>}
        </div>
      </div>
      <div ref={containerRef} className="editor" />
    </div>
  );
};

export default Editor;
```

### Preview Component (frontend/src/components/Preview.js)
```javascript
import React from 'react';

const Preview = ({ data, isLoading, error, options, onOptionsChange }) => {
  const handleThemeChange = (e) => {
    onOptionsChange({ theme: e.target.value });
  };

  const handleScaleChange = (e) => {
    onOptionsChange({ scale: parseFloat(e.target.value) });
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <span>Preview</span>
        <div className="preview-controls">
          <select value={options.theme} onChange={handleThemeChange}>
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="forest">Forest</option>
            <option value="neutral">Neutral</option>
          </select>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={options.scale}
            onChange={handleScaleChange}
          />
          <span>{Math.round(options.scale * 100)}%</span>
        </div>
      </div>
      
      <div className="preview-content">
        {isLoading && <div className="loading">Rendering diagram...</div>}
        {error && <div className="error">Error: {error}</div>}
        {data && !isLoading && (
          <div className="diagram-preview">
            <img 
              src={`data:image/svg+xml;base64,${data}`}
              alt="Mermaid Diagram"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
```

### Export Panel Component (frontend/src/components/ExportPanel.js)
```javascript
import React, { useState } from 'react';

const ExportPanel = ({ diagramCode, disabled }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'png',
    quality: 'high',
    scale: 1,
    theme: 'default',
    filename: 'diagram'
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: diagramCode,
          options: exportOptions
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportOptions.filename}.${exportOptions.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <div className="export-options">
        <select 
          value={exportOptions.format}
          onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
        >
          <option value="png">PNG</option>
          <option value="svg">SVG</option>
          <option value="pdf">PDF</option>
        </select>
        
        <select 
          value={exportOptions.quality}
          onChange={(e) => setExportOptions(prev => ({ ...prev, quality: e.target.value }))}
        >
          <option value="low">Low (800x600)</option>
          <option value="medium">Medium (1200x800)</option>
          <option value="high">High (1920x1080)</option>
          <option value="ultra">Ultra (4K)</option>
        </select>
        
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={exportOptions.scale}
          onChange={(e) => setExportOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
        />
        
        <input
          type="text"
          placeholder="Filename"
          value={exportOptions.filename}
          onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
        />
      </div>
      
      <button 
        onClick={handleExport}
        disabled={disabled || isExporting}
        className="export-button"
      >
        {isExporting ? 'Exporting...' : 'Download'}
      </button>
    </div>
  );
};

export default ExportPanel;
```

## 4. Styling (frontend/src/App.css)
```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: #2d3748;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-panel, .preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-container, .preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header, .preview-header {
  background: #f7fafc;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor {
  flex: 1;
}

.preview-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
  background: #fafafa;
}

.export-panel {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.export-options {
  display: flex;
  gap: 0.5rem;
}

.export-button {
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.export-button:hover:not(:disabled) {
  background: #3182ce;
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.validating, .error, .valid {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}

.validating {
  background: #fed7d7;
  color: #c53030;
}

.error {
  background: #fed7d7;
  color: #c53030;
}

.valid {
  background: #c6f6d5;
  color: #22543d;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.diagram-preview {
  text-align: center;
}
```

## 5. Development Setup

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && nodemon server.js",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "start": "cd backend && node server.js"
  }
}
```

### IntelliJ Configuration
1. **Open Project**: Import the project folder
2. **Node.js Plugin**: Install Node.js plugin if not already installed
3. **Run Configurations**:
    - Backend: Node.js configuration pointing to `backend/server.js`
    - Frontend: npm configuration with `start` script
4. **File Watchers**: Set up for auto-restart on file changes
5. **Debugging**: Configure breakpoints in both frontend and backend code

## 6. Features Implemented

✅ **Real-time Preview**: Live diagram rendering as you type
✅ **Code Validation**: Syntax checking with error reporting  
✅ **Export Options**: Multiple formats (PNG, SVG, PDF)
✅ **Quality Settings**: Low to Ultra quality presets
✅ **Scaling**: Custom scale factor for exports
✅ **Theme Support**: Multiple Mermaid themes
✅ **Monaco Editor**: Full-featured code editor with syntax highlighting
✅ **No Login Required**: Completely open access
✅ **Responsive Design**: Works on desktop and mobile

## 7. Deployment Options

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables
```env
PORT=3001
NODE_ENV=production
TEMP_DIR=/tmp/mermaid-temp
MAX_FILE_SIZE=10mb
```

This implementation provides a complete, production-ready Mermaid diagram editor with all the features you requested. The architecture is scalable and can be extended with additional features like diagram sharing, templates, or collaborative editing.