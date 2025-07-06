import { Box, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';
import InputActions from '../InputActions';
import { parse, unparse } from '../../utils/trivial';

const Origin: React.FC<StepProps> = ({ data, mergeWizardData }) => {
  const [parsedData, setParsedData] = useState<string | null>(null);

  useEffect(() => {
    if (data.origin) {
      try {
        setParsedData(parse(data.origin));
      } catch (error) {
        console.error('Error parsing linking data:', error);
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  }, [data.origin]);

  const handleDataChange = (value: string) => {
    try {
      setParsedData(parse(value));
      mergeWizardData('origin', value);
    } catch (error) {
      console.error('Error parsing input data:', error);
      setParsedData(null);
      mergeWizardData('origin', null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
          Step 1: Input Text
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the text you want to annotate with linguistic data.
        </Typography>
      </Box>

      <InputActions
        acceptFileTypes=".txt"
        defaultFileName="input-text"
        dragPlaceholder="Drop your file here..."
        onDataChange={handleDataChange}
        placeholder="Enter your raw text here or drag & drop a file..."
        rows={10}
        showOutputButtons={true}
        showTextField={true}
        value={parsedData ? unparse(parsedData) : ''}
      />
    </Box>
  );
};

export default Origin;
