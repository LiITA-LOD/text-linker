import type React from 'react';
import { useEffect, useState } from 'react';
import './Step.css';
import type { StepProps } from '../../types';
import InputActions from './InputActions';

const InputConllu: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ conllu: data.conllu || '' });
  }, []);

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
        <InputActions
          onDataChange={onDataChange}
          dataKey="conllu"
          value={data.conllu || ''}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          acceptFileTypes=".conllu,.txt,.tsv"
          placeholder="Enter CoNLL-U format data here or drag & drop a file..."
          dragPlaceholder="Drop your CoNLL-U file here..."
          rows={10}
          className="no-wrap"
        />

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
