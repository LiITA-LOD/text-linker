import { useEffect } from 'react';
import './Step.css';

const InputConllu = ({ data, onDataChange }) => {
  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ conllu: data.conllu || '' });
  }, []);

  const handleConlluChange = (e) => {
    onDataChange({ conllu: e.target.value });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>Step 2: Input CONLLU</h3>
        <p>Enter the CONLLU format data for morphological and syntactic annotation.</p>
      </div>
      
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="conllu-input">CONLLU Data</label>
          <textarea
            id="conllu-input"
            value={data.conllu || ''}
            onChange={handleConlluChange}
            placeholder="Enter CONLLU format data here..."
            rows={10}
            className="form-control"
          />
        </div>
        
        <div className="text-info">
          <p><strong>CONLLU Format:</strong> Each line represents a token with tab-separated fields: ID, FORM, LEMMA, UPOS, XPOS, FEATS, HEAD, DEPREL, DEPS, MISC</p>
          <p><strong>Example:</strong></p>
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