import { Box, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';
import { parse, unparse } from '../../utils/trivial';
import InputActions from '../InputActions';

const Turtle: React.FC<StepProps> = ({ data, mergeWizardData }) => {
  const [parsedData, setParsedData] = useState<string | null>(null);

  useEffect(() => {
    if (data.turtle) {
      try {
        setParsedData(parse(data.turtle));
      } catch (error) {
        console.error('Error parsing linking data:', error);
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  }, [data.turtle]);

  const handleDataChange = (value: string) => {
    try {
      setParsedData(parse(value));
      mergeWizardData('turtle', value);
    } catch (error) {
      console.error('Error parsing input data:', error);
      setParsedData(null);
      mergeWizardData('turtle', null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
          Step 4: Export TTL
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and export the generated TTL (Turtle) format data.
        </Typography>
      </Box>

      <InputActions
        acceptFileTypes=".ttl"
        defaultFileName="linguistic-annotation"
        dragPlaceholder="Drop your TTL file here..."
        onDataChange={handleDataChange}
        placeholder="Enter your TTL data here or drag & drop a file..."
        rows={10}
        showOutputButtons={true}
        showTextField={true}
        value={parsedData ? unparse(parsedData) : ''}
      />
    </Box>
  );
};

export default Turtle;
