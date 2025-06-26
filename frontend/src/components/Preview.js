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
      options: JSON.stringify(options)
    });
  }, [data, isLoading, error, options]);

  const handleThemeChange = (e) => {
    console.log('🎨 Theme changed to:', e.target.value);
    onOptionsChange({ theme: e.target.value });
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
            <p>{error}</p>
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

    console.log('✅ Rendering diagram with data:');
    console.log('📊 Data details:', {
      length: data.length,
      firstChars: data.substring(0, 100),
      lastChars: data.substring(data.length - 50),
      isBase64Valid: /^[A-Za-z0-9+/]*={0,2}$/.test(data)
    });

    const imageDataUri = `data:image/svg+xml;base64,${data}`;
    console.log('🖼️ Image data URI created:', imageDataUri.substring(0, 100) + '...');

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
              console.log('📐 Image dimensions:', {
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight,
                displayWidth: e.target.width,
                displayHeight: e.target.height
              });
              setImageLoadStatus('loaded');
            }}
            onError={(e) => {
              console.error('❌ Image load error:', e);
              console.error('❌ Failed image src length:', e.target.src.length);
              console.error('❌ Error details:', {
                src: e.target.src.substring(0, 100) + '...',
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight
              });
              setImageLoadStatus('error');

              // Try alternative formats if SVG fails
              const img = e.target;
              if (img.src.includes('svg+xml')) {
                console.log('🔄 Trying PNG format...');
                img.src = `data:image/png;base64,${data}`;
              } else if (img.src.includes('png')) {
                console.log('🔄 PNG also failed, trying as raw SVG...');
                // Try to decode base64 and use as raw SVG
                try {
                  const decodedSvg = atob(data);
                  console.log('📄 Decoded SVG content:', decodedSvg.substring(0, 200) + '...');
                  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(decodedSvg)}`;
                } catch (decodeError) {
                  console.error('❌ Failed to decode base64:', decodeError);
                }
              }
            }}
            style={{
              border: imageLoadStatus === 'error' ? '2px solid red' : 'none',
              background: imageLoadStatus === 'error' ? '#ffebee' : 'transparent'
            }}
          />
          {imageLoadStatus === 'error' && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(255,0,0,0.8)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
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
              Theme: {options.theme} | Status: {imageLoadStatus}
            </div>
          )}
        </div>

        <div className="preview-controls">
          <div className="control-group">
            <label>Theme:</label>
            <select value={options.theme} onChange={handleThemeChange}>
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          {data && (
            <>
              <div className="control-group">
                <label>Zoom:</label>
                <div className="zoom-controls">
                  <button className="zoom-btn" onClick={handleZoomOut}>−</button>
                  <span className="zoom-display">{Math.round(zoom * 100)}%</span>
                  <button className="zoom-btn" onClick={handleZoomIn}>+</button>
                  <button className="reset-btn" onClick={handleResetZoom}>Reset</button>
                </div>
              </div>

              <button className="fullscreen-btn" onClick={toggleFullscreen}>
                {isFullscreen ? '⤓' : '⤢'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="preview-content">
        {renderContent()}
      </div>

      {data && (
        <div className="preview-footer">
          <div className="diagram-stats">
            <span>✓ Data received ({data.length} chars)</span>
            <span>•</span>
            <span>Format: SVG</span>
            <span>•</span>
            <span>Load Status: {imageLoadStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;

