import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

const Editor = ({ value, onChange, error, isValidating }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
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
        value: value || '',
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
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value || '');
    }
  }, [value]);

  const lineCount = value ? value.split('\n').length : 0;

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title">
          <span className="title">📝 Mermaid Code</span>
          <div className="editor-info">
            <span className="line-count">{lineCount} lines</span>
          </div>
        </div>
        <div className="editor-status">
          {isValidating && (
            <div className="loading-spinner"></div>
          )}
          {error && <span className="status error">❌ {error}</span>}
          {!isValidating && !error && <span className="status valid">✅ Valid</span>}
        </div>
      </div>
      <div ref={containerRef} className="editor-monaco" />
      <div className="editor-footer">
        <div className="editor-info">
          Monaco Editor • Mermaid Syntax Highlighting
        </div>
      </div>
    </div>
  );
};

export default Editor;

