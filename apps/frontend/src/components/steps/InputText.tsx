import React, { useEffect, useRef, useState } from 'react';
import './Step.css';
import type { StepProps } from '../../types';

const InputText: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ text: data.text || '' });
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onDataChange({ text: e.target.value });
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      onDataChange({ text: text });
      // Focus the textarea after pasting
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Unable to access clipboard. Please paste manually using Ctrl+V.');
    }
  };

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await readFileAsText(file);
      onDataChange({ text: text });
    } catch (err) {
      console.error('Error reading file:', err);
      alert('Error reading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handlePasteEvent = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Handle Ctrl+V paste events
    if (e.ctrlKey && e.key === 'v') {
      // The default paste behavior will handle this
      // We just need to make sure our textarea is focused
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>Step 1: Input Text</h3>
        <p>Enter the text you want to annotate with linguistic data.</p>
      </div>
      
      <div className="step-content">
        <div className="input-actions">
          <button 
            className="btn btn-secondary"
            onClick={handlePaste}
            disabled={isLoading}
          >
            📋 Paste from Clipboard
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            📁 Upload File
          </button>
          <button 
            className="btn btn-skip"
            onClick={() => onDataChange({ skipTextStep: true })}
            disabled={isLoading}
          >
            ⏭️ Skip
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.html,.xml,.json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="text-input">Text Content</label>
          <div 
            className={`text-input-container ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              id="text-input"
              value={data.text || ''}
              onChange={handleTextChange}
              onKeyDown={handlePasteEvent}
              placeholder={isDragOver ? "Drop your file here..." : "Enter your text here or drag & drop a file..."}
              rows={8}
              className="form-control"
              disabled={isLoading}
            />
            {isDragOver && (
              <div className="drag-overlay">
                <div className="drag-message">
                  📄 Drop file here to load its content
                </div>
              </div>
            )}
            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-message">Loading file...</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-info">
          <p><strong>Input Methods:</strong></p>
          <ul className="input-methods">
            <li>📝 Type or paste text directly (Ctrl+V)</li>
            <li>📋 Use the "Paste from Clipboard" button</li>
            <li>📁 Click "Upload File" to select a file</li>
            <li>📄 Drag & drop a file directly onto the text area</li>
            <li>⏭️ Click "Skip" if you already have CONLLU data</li>
          </ul>
          <p><strong>Supported file types:</strong> .txt, .md, .html, .xml, .json</p>
        </div>
      </div>
    </div>
  );
};

export default InputText; 