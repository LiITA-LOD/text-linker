import { useEffect } from 'react';
import './Step.css';

const InputLinking = ({ data, onDataChange }) => {
  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ linking: data.linking || '' });
  }, []);

  const handleLinkingChange = (e) => {
    onDataChange({ linking: e.target.value });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>Step 3: Input Linking</h3>
        <p>Enter the linking data to connect tokens with external linguistic resources.</p>
      </div>
      
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="linking-input">Linking Data</label>
          <textarea
            id="linking-input"
            value={data.linking || ''}
            onChange={handleLinkingChange}
            placeholder="Enter linking data here..."
            rows={8}
            className="form-control"
          />
        </div>
        
        <div className="text-info">
          <p><strong>Linking Format:</strong> Define connections between tokens and external linguistic resources, knowledge bases, or lexical databases.</p>
          <p><strong>Example:</strong></p>
          <pre className="code-example">
{`token_id:1 -> resource:LiLaLemma -> lemma_id:latin_cat
token_id:2 -> resource:LiLaBrill -> brill_id:brill_cat_noun
token_id:3 -> resource:LiLaIGVL -> igvl_id:igvl_sit_verb`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InputLinking; 