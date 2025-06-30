import { useEffect } from 'react';
import './Step.css';

const InputText = ({ data, onDataChange }) => {
  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ text: data.text || '' });
  }, []);

  const handleTextChange = (e) => {
    onDataChange({ text: e.target.value });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>Step 1: Input Text</h3>
        <p>Enter the text you want to annotate with linguistic data.</p>
      </div>
      
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="text-input">Text Content</label>
          <textarea
            id="text-input"
            value={data.text || ''}
            onChange={handleTextChange}
            placeholder="Enter your text here..."
            rows={8}
            className="form-control"
          />
        </div>
        
        <div className="text-info">
          <p><strong>Tip:</strong> You can paste text from any source. The text will be processed in the next steps.</p>
        </div>
      </div>
    </div>
  );
};

export default InputText; 