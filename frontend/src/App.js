import React, { useState, useCallback, useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ExportPanel from './components/ExportPanel';
import { DiagramService } from './services/DiagramService';
import './styles/App.css';

const DEFAULT_DIAGRAM = `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
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

  // Debounce function to prevent excessive API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Validate and render diagram
  const validateAndRender = useCallback(async (code, options) => {
    console.log('🚀 App.validateAndRender called with:', {
      codeLength: code?.length,
      codeFirstLine: code?.split('\n')[0],
      options,
      timestamp: new Date().toISOString()
    });

    if (!code.trim()) {
      console.log('⚠️ Empty code, clearing preview');
      setPreviewData(null);
      setValidationError(null);
      return;
    }

    console.log('⏳ Starting validation process...');
    setIsValidating(true);
    setValidationError(null);

    try {
      // First validate the diagram
      console.log('🔍 Step 1: Validating diagram...');
      const validation = await DiagramService.validateDiagram(code);
      console.log('✅ Validation completed:', validation);

      if (!validation.valid) {
        console.log('❌ Validation failed:', validation.error);
        setValidationError(validation.error);
        setPreviewData(null);
        return;
      }

      // If valid, render for preview
      console.log('🎨 Step 2: Rendering diagram for preview...');
      const renderResult = await DiagramService.renderDiagram(code, {
        ...options,
        format: 'svg' // Force SVG for preview - it's smaller and renders better
      });
      console.log('🎨 Render completed:', {
        success: renderResult.success,
        error: renderResult.error,
        dataLength: renderResult.data?.length
      });

      if (renderResult.success) {
        console.log('✅ Setting preview data:', {
          dataLength: renderResult.data.length,
          dataSample: renderResult.data.substring(0, 50) + '...'
        });
        setPreviewData(renderResult.data);
        setValidationError(null);
      } else {
        console.log('❌ Render failed:', renderResult.error);
        setValidationError(renderResult.error);
        setPreviewData(null);
      }
    } catch (error) {
      console.error('💥 Validation/Render error:', error);
      setValidationError(`Error: ${error.message}`);
      setPreviewData(null);
    } finally {
      console.log('🏁 Validation process completed');
      setIsValidating(false);
    }
  }, []);

  // Debounced version to avoid excessive API calls while typing
  const debouncedValidateAndRender = useCallback(
    debounce(validateAndRender, 800),
    [validateAndRender]
  );

  // Effect to trigger validation when code or options change
  useEffect(() => {
    debouncedValidateAndRender(diagramCode, previewOptions);
  }, [diagramCode, previewOptions, debouncedValidateAndRender]);

  // Handle code changes from the editor
  const handleCodeChange = (newCode) => {
    setDiagramCode(newCode);
  };

  // Handle preview option changes
  const handlePreviewOptionsChange = (newOptions) => {
    setPreviewOptions(prev => ({ ...prev, ...newOptions }));
  };

  // Load example diagram
  const loadExample = async (type = 'flowchart') => {
    try {
      const example = await DiagramService.getExampleDiagram(type);
      setDiagramCode(example.example);
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>📊 Mermaid Diagram Editor</h1>
          <div className="header-status">
            {isValidating && <span className="status validating">Validating...</span>}
            {!isValidating && !validationError && previewData && (
              <span className="status valid">✓ Valid</span>
            )}
            {validationError && <span className="status error">✗ Error</span>}
          </div>
        </div>

        <div className="header-right">
          <ExportPanel
            diagramCode={diagramCode}
            disabled={!previewData || isValidating || !!validationError}
            onLoadExample={loadExample}
          />
        </div>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <Editor
            value={diagramCode}
            onChange={handleCodeChange}
            error={validationError}
            isValidating={isValidating}
          />
        </div>

        <div className="preview-section">
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
