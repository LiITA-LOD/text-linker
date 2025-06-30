import { useEffect, useState } from 'react';
import './Step.css';

const ExportTTL = ({ data, onDataChange }) => {
  const [generatedTTL, setGeneratedTTL] = useState('');

  useEffect(() => {
    // Generate TTL from the collected data
    generateTTL();
  }, [data]);

  const generateTTL = () => {
    // Simple TTL generation based on the collected data
    let ttl = `# Generated TTL for Linguistic Data Annotation
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix lila: <http://lila-erc.eu/ontologies/lila/> .
@prefix text: <http://example.org/text/> .
@prefix token: <http://example.org/token/> .

# Text content
text:main rdf:type lila:Text ;
    lila:hasContent "${data.text || ''}" .

`;

    // Add CONLLU data if available
    if (data.conllu) {
      ttl += `# CONLLU annotations
${data.conllu.split('\n').filter(line => line.trim()).map((line, index) => {
  const parts = line.split('\t');
  if (parts.length >= 8) {
    return `token:${parts[0]} rdf:type lila:Token ;
    lila:hasForm "${parts[1]}" ;
    lila:hasLemma "${parts[2]}" ;
    lila:hasUPOS "${parts[3]}" ;
    lila:hasXPOS "${parts[4]}" ;
    lila:hasFeatures "${parts[5]}" ;
    lila:hasHead "${parts[6]}" ;
    lila:hasDepRel "${parts[7]}" .`;
  }
  return '';
}).join('\n')}
`;
    }

    // Add linking data if available
    if (data.linking) {
      ttl += `# Linking data
${data.linking.split('\n').filter(line => line.trim()).map(line => {
  const parts = line.split(' -> ');
  if (parts.length >= 3) {
    const tokenId = parts[0].split(':')[1];
    const resource = parts[1].split(':')[1];
    const resourceId = parts[2].split(':')[1];
    return `token:${tokenId} lila:linksTo <http://lila-erc.eu/resource/${resource}/${resourceId}> .`;
  }
  return '';
}).join('\n')}
`;
    }

    setGeneratedTTL(ttl);
    onDataChange({ ttl });
  };

  const handleTTLChange = (e) => {
    const newTTL = e.target.value;
    setGeneratedTTL(newTTL);
    onDataChange({ ttl: newTTL });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedTTL], { type: 'text/turtle' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linguistic-annotation.ttl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>Step 4: Export TTL</h3>
        <p>Review and export the generated TTL (Turtle) format data.</p>
      </div>
      
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="ttl-output">Generated TTL</label>
          <textarea
            id="ttl-output"
            value={generatedTTL}
            onChange={handleTTLChange}
            placeholder="Generated TTL will appear here..."
            rows={12}
            className="form-control"
            readOnly={false}
          />
        </div>
        
        <div className="step-actions">
          <button 
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={!generatedTTL.trim()}
          >
            Download TTL File
          </button>
        </div>
        
        <div className="text-info">
          <p><strong>TTL Format:</strong> Turtle is a text-based format for representing RDF data. This file contains all the linguistic annotations and linking data in a structured format.</p>
        </div>
      </div>
    </div>
  );
};

export default ExportTTL; 