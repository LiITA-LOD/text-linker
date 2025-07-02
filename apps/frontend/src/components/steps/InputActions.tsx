import React, { useState, useRef } from 'react';

interface InputActionsProps {
  onDataChange: (data: { [key: string]: string }) => void;
  dataKey: string; // The key to use when calling onDataChange (e.g., 'text', 'conllu')
  value: string; // Current value of the textarea
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  acceptFileTypes: string; // File input accept attribute
  placeholder: string;
  dragPlaceholder: string;
  rows?: number;
  className?: string;
}

const InputActions: React.FC<InputActionsProps> = ({
  onDataChange,
  dataKey,
  value,
  isLoading,
  setIsLoading,
  acceptFileTypes,
  placeholder,
  dragPlaceholder,
  rows = 8,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    onDataChange({ [dataKey]: e.target.value });
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      onDataChange({ [dataKey]: text });
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
      onDataChange({ [dataKey]: text });
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

  const handlePasteEvent = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    // Handle Ctrl+V paste events
    if (e.ctrlKey && e.key === 'v') {
      // The default paste behavior will handle this
      // We just need to make sure our textarea is focused
    }
  };

  return (
    <>
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
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptFileTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`${dataKey}-input`}>
          {dataKey.charAt(0).toUpperCase() + dataKey.slice(1)} Content
        </label>
        <div
          className={`text-input-container ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            id={`${dataKey}-input`}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handlePasteEvent}
            placeholder={isDragOver ? dragPlaceholder : placeholder}
            rows={rows}
            className={`form-control ${className}`}
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
    </>
  );
};

export default InputActions; 