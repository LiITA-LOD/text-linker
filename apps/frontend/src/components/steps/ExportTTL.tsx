import { Download } from '@mui/icons-material';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';

const ExportTTL: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [generatedTTL, setGeneratedTTL] = useState<string>('');

  useEffect(() => {
    // Generate TTL from the collected data
    generateTTL();
  }, [data]);

  const generateTTL = (): void => {
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

    // Add CoNLL-U data if available
    if (data.conllu) {
      ttl += `# CoNLL-U annotations
${data.conllu
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => {
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
  })
  .join('\n')}
`;
    }

    // Add linking data if available
    if (data.linking) {
      ttl += `# Linking data
${data.linking
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => {
    const parts = line.split(' -> ');
    if (parts.length >= 3) {
      const tokenId = parts[0].split(':')[1];
      const resource = parts[1].split(':')[1];
      const resourceId = parts[2].split(':')[1];
      return `token:${tokenId} lila:linksTo <http://lila-erc.eu/resource/${resource}/${resourceId}> .`;
    }
    return '';
  })
  .join('\n')}
`;
    }

    setGeneratedTTL(ttl);
    onDataChange({ ttl });
  };

  const handleTTLChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newTTL = e.target.value;
    setGeneratedTTL(newTTL);
    onDataChange({ ttl: newTTL });
  };

  const handleDownload = (): void => {
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
    <Paper
      elevation={0}
      sx={{
        p: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
          Step 4: Export TTL
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and export the generated TTL (Turtle) format data.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          multiline
          rows={12}
          value={generatedTTL}
          onChange={handleTTLChange}
          placeholder="Generated TTL will appear here..."
          fullWidth
          variant="outlined"
          label="Generated TTL"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused': {
                border: '2px solid #6366f1',
              },
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!generatedTTL.trim()}
        >
          Download TTL File
        </Button>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          <strong>TTL Format:</strong> Turtle is a text-based format for
          representing RDF data. This file contains all the linguistic
          annotations and linking data in a structured format.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ExportTTL;
