import {
  Box,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';
import InputActions from './InputActions';

const InputText: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ text: data.text || '' });
  }, []);

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
        onDataChange={onDataChange}
        dataKey="text"
        value={data.text || ''}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        acceptFileTypes=".txt"
        placeholder="Enter your raw text here or drag & drop a file..."
        dragPlaceholder="Drop your file here..."
        rows={10}
        showOutputButtons={true}
        defaultFileName="input-text"
      />
    </Box>
  );
};

export default InputText;
