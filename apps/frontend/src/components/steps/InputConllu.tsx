import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import './Step.css';
import type { StepProps } from '../../types';

const InputConllu: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ conllu: data.conllu || '' });
  }, []);

  const handleConlluChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    onDataChange({ conllu: e.target.value });
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      onDataChange({ conllu: text });
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
      onDataChange({ conllu: text });
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
    <div className="step-container">
      <div className="step-header">
        <h3>Step 2: Input CoNLL-U</h3>
        <p>
          Enter the CoNLL-U format data for morphological and syntactic
          annotation.
        </p>
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".conllu,.txt,.tsv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="conllu-input">CoNLL-U Data</label>
          <div
            className={`text-input-container ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              id="conllu-input"
              value={data.conllu || ''}
              onChange={handleConlluChange}
              onKeyDown={handlePasteEvent}
              placeholder={
                isDragOver
                  ? 'Drop your CoNLL-U file here...'
                  : 'Enter CoNLL-U format data here or drag & drop a file...'
              }
              rows={10}
              className="form-control no-wrap"
              disabled={isLoading}
            />
            {isDragOver && (
              <div className="drag-overlay">
                <div className="drag-message">
                  📄 Drop CoNLL-U file here to load its content
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
          <p>
            <strong>Input Methods:</strong>
          </p>
          <ul className="input-methods">
            <li>📝 Type or paste CoNLL-U data directly (Ctrl+V)</li>
            <li>📋 Use the "Paste from Clipboard" button</li>
            <li>📁 Click "Upload File" to select a CoNLL-U file</li>
            <li>📄 Drag & drop a CoNLL-U file directly onto the text area</li>
          </ul>
          <p>
            <strong>CoNLL-U Format:</strong> Each line represents a token with
            tab-separated fields: ID, FORM, LEMMA, UPOS, XPOS, FEATS, HEAD,
            DEPREL, DEPS, MISC
          </p>
          <p>
            <strong>Supported file types:</strong> .conllu, .txt, .tsv
          </p>
          <p>
            <strong>Example:</strong>
          </p>
          <pre className="code-example">
            {`1	The	the	DET	DT	Definite=Def|PronType=Art	2	det	_	_
2	cat	cat	NOUN	NN	Number=Sing	3	nsubj	_	_
3	sat	sit	VERB	VBD	Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin	0	root	_	_`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InputConllu;
