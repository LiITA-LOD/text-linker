import { Box, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';
import {
  type ConlluDocument,
  parse,
  serialize as unparse,
} from '../../utils/conllu';
import InputActions from '../InputActions';

const Conllu: React.FC<StepProps> = ({ data, mergeWizardData }) => {
  const [parsedData, setParsedData] = useState<ConlluDocument | null>(null);

  useEffect(() => {
    if (data.conllu) {
      try {
        setParsedData(parse(data.conllu));
      } catch (error) {
        console.error('Error parsing linking data:', error);
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  }, [data.conllu]);

  const handleDataChange = (value: string) => {
    try {
      setParsedData(parse(value));
      mergeWizardData('conllu', value);
    } catch (error) {
      console.error('Error parsing input data:', error);
      setParsedData(null);
      mergeWizardData('conllu', null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
          Step 2: Input CoNLL-U
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the CoNLL-U format data for morphological and syntactic
          annotation.
        </Typography>
      </Box>

      <InputActions
        acceptFileTypes=".conllu"
        defaultFileName="input-conllu"
        dragPlaceholder="Drop your CoNLL-U file here..."
        onDataChange={handleDataChange}
        placeholder="Enter your CoNLL-U data here or drag & drop a file..."
        rows={10}
        showOutputButtons={true}
        showTextField={true}
        value={parsedData ? unparse(parsedData) : ''}
      />
    </Box>
  );
};

export default Conllu;
