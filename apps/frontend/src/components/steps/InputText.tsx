import type React from 'react';
import { useEffect, useState } from 'react';
import './Step.css';
import type { StepProps } from '../../types';
import InputActions from './InputActions';

const InputText: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ text: data.text || '' });
  }, []);

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>Step 1: Input Text</h3>
        <p>Enter the text you want to annotate with linguistic data.</p>
      </div>

      <div className="step-content">
        <InputActions
          onDataChange={onDataChange}
          dataKey="text"
          value={data.text || ''}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          acceptFileTypes=".txt,.md,.html,.xml,.json"
          placeholder="Enter your text here or drag & drop a file..."
          dragPlaceholder="Drop your file here..."
          rows={8}
        />

        <div className="text-info">
          <p>
            <strong>Input Methods:</strong>
          </p>
          <ul className="input-methods">
            <li>📝 Type or paste text directly (Ctrl+V)</li>
            <li>📋 Use the "Paste from Clipboard" button</li>
            <li>📁 Click "Upload File" to select a file</li>
            <li>📄 Drag & drop a file directly onto the text area</li>
          </ul>
          <p>
            <strong>Supported file types:</strong> .txt, .md, .html, .xml, .json
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputText;
