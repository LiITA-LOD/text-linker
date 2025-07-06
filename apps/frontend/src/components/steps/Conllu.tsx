import { Box, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';
import InputActions from './InputActions';

const Conllu: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ conllu: data.conllu || '' });
  }, []);

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
        onDataChange={onDataChange}
        dataKey="conllu"
        value={data.conllu || ''}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        acceptFileTypes=".conllu"
        placeholder="Enter your CoNLL-U data here or drag & drop a file..."
        dragPlaceholder="Drop your CoNLL-U file here..."
        rows={10}
        showOutputButtons={true}
        defaultFileName="input-conllu"
      />
    </Box>
  );
};

export default Conllu;
