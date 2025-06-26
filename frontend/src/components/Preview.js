import React, { useState, useEffect } from 'react';

const Preview = ({ data, isLoading, error, options, onOptionsChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageLoadStatus, setImageLoadStatus] = useState('pending');

  // Debug effect to track prop changes
  useEffect(() => {
    console.log('🔍 Preview props changed:', {
      hasData: !!data,
      dataType: typeof data,
      dataLength: data?.length,
      dataSample: data ? data.substring(0, 50) + '...' : null,
      isLoading,
      error,
      options: options ? JSON.stringify(options) : null
    });
  }, [data, isLoading, error, options]);

  const handleThemeChange = (e) => {
    console.log('🎨 Theme changed to:', e.target.value);
    if (onOptionsChange) {
      onOptionsChange({ theme: e.target.value });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 3);
    console.log('🔍 Zoom in to:', newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    console.log('🔍 Zoom out to:', newZoom);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    console.log('🔍 Reset zoom to 1');
    setZoom(1);
  };

  const toggleFullscreen = () => {
    console.log('📺 Toggle fullscreen:', !isFullscreen);
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    console.log('🔍 Preview renderContent called:', {
      isLoading,
      error,
      hasData: !!data,
      dataLength: data?.length,
      imageLoadStatus
    });

    if (isLoading) {
      console.log('⏳ Showing loading state');
      return (
        <div className="preview-loading">
          <div className="loading-spinner"></div>
          <span>Rendering diagram...</span>
        </div>
      );
    }

    if (error) {
      console.error('❌ Preview error:', error);
      return (
        <div className="preview-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">
            <h3>Diagram Error</h3>
            <p>{String(error)}</p>
            <div className="error-suggestions">
              <p>Common fixes:</p>
              <ul>
                <li>Check diagram syntax and structure</li>
                <li>Ensure proper diagram type declaration</li>
                <li>Verify node connections and arrows</li>
                <li>Remove special characters if present</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (!data) {
      console.log('ℹ️ No data for preview');
      return (
        <div className="preview-empty">
          <div className="empty-icon">📊</div>
          <h3>Start Creating Your Diagram</h3>
          <p>Type your Mermaid code in the editor to see a live preview</p>
          <div className="preview-examples">
            <p>Try these examples:</p>
            <div>
              <code>flowchart TD</code> - for flowcharts
            </div>
            <div>
              <code>sequenceDiagram</code> - for sequence diagrams
            </div>
            <div>
              <code>classDiagram</code> - for class diagrams
            </div>
          </div>
        </div>
      );
    }

    console.log('✅ Rendering diagram with data');
    const imageDataUri = `data:image/svg+xml;base64,${data}`;

    return (
      <div className="preview-diagram">
        <div
          className="diagram-wrapper"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={imageDataUri}
            alt="Mermaid Diagram"
            className="diagram-image"
            onLoad={(e) => {
              console.log('✅ Image loaded successfully!');
              setImageLoadStatus('loaded');
            }}
            onError={(e) => {
              console.error('❌ Image load error:', e);
              setImageLoadStatus('error');
            }}
          />
          {imageLoadStatus === 'error' && (
            <div className="image-error-overlay">
              Image Load Failed
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`preview-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="preview-header">
        <div className="preview-title">
          🔍 Preview
          {data && (
            <div className="preview-info">
              Theme: {options?.theme || 'default'} | Status: {imageLoadStatus}
            </div>
          )}
        </div>

        <div className="preview-controls">
          <div className="control-group">
            <label>Theme:</label>
            <select value={options?.theme || 'default'} onChange={handleThemeChange}>
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div className="control-group">
            <label>Zoom:</label>
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={handleZoomOut}>-</button>
              <span className="zoom-display">{Math.round(zoom * 100)}%</span>
              <button className="zoom-btn" onClick={handleZoomIn}>+</button>
              <button className="reset-btn" onClick={handleResetZoom}>Reset</button>
            </div>
          </div>

          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      <div className="preview-content">
        {renderContent()}
      </div>

      <div className="preview-footer">
        <div className="diagram-stats">
          {data && (
            <>
              <span>Size: {Math.round(data.length * 0.75 / 1024)} KB</span>
              <span>•</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;

