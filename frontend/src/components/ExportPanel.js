import React, { useState } from 'react';
import { DiagramService } from '../services/DiagramService';

const ExportPanel = ({ diagramCode, disabled, onLoadExample }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'png',
    quality: 'high',
    scale: 1,
    theme: 'default',
    filename: 'diagram'
  });

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);

    try {
      const response = await DiagramService.exportDiagram(diagramCode, exportOptions);

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
        setShowDialog(false);
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadExample = (type) => {
    if (onLoadExample) {
      onLoadExample(type);
    }
  };

  const updateExportOption = (key, value) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="export-panel">
        <div className="example-loader">
          <select
            className="example-select"
            onChange={(e) => handleLoadExample(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Load Example</option>
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option>
          </select>
        </div>

        <button
          className="export-button"
          onClick={() => setShowDialog(true)}
          disabled={disabled}
        >
          📤 Export
        </button>
      </div>

      {showDialog && (
        <div className="export-dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Export Diagram</h3>
              <button
                className="close-button"
                onClick={() => setShowDialog(false)}
              >
                ×
              </button>
            </div>

            <div className="dialog-content">
              <div className="export-options">
                <div className="option-group">
                  <label>Format:</label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => updateExportOption('format', e.target.value)}
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div className="option-group">
                  <label>Quality:</label>
                  <select
                    value={exportOptions.quality}
                    onChange={(e) => updateExportOption('quality', e.target.value)}
                  >
                    <option value="low">Low (800x600)</option>
                    <option value="medium">Medium (1200x800)</option>
                    <option value="high">High (1920x1080)</option>
                    <option value="ultra">Ultra (4K)</option>
                  </select>
                </div>

                <div className="option-group">
                  <label>Theme:</label>
                  <select
                    value={exportOptions.theme}
                    onChange={(e) => updateExportOption('theme', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="dark">Dark</option>
                    <option value="forest">Forest</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div className="option-group">
                  <label>Filename:</label>
                  <input
                    type="text"
                    value={exportOptions.filename}
                    onChange={(e) => updateExportOption('filename', e.target.value)}
                    placeholder="diagram"
                  />
                  <span className="filename-extension">.{exportOptions.format}</span>
                </div>
              </div>

              <div className="export-preview">
                <h4>Export Preview</h4>
                <div className="preview-info">
                  <div className="info-item">
                    <span>Format:</span>
                    <strong>{exportOptions.format.toUpperCase()}</strong>
                  </div>
                  <div className="info-item">
                    <span>Quality:</span>
                    <strong>{exportOptions.quality}</strong>
                  </div>
                  <div className="info-item">
                    <span>Theme:</span>
                    <strong>{exportOptions.theme}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                className="button secondary"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="spinner small"></div>
                    Exporting...
                  </>
                ) : (
                  'Download'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportPanel;

