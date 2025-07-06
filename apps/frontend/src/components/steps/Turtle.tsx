import {
  Box,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { StepProps } from '../../types';
import InputActions from './InputActions';

const Turtle: React.FC<StepProps> = ({ data, onDataChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Update parent component when data changes
    onDataChange({ ttl: data.ttl || '' });
  }, []);

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
        onDataChange={onDataChange}
        dataKey="ttl"
        value={data.ttl || ''}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        acceptFileTypes=".ttl"
        placeholder="Enter your TTL data here or drag & drop a file..."
        dragPlaceholder="Drop your TTL file here..."
        rows={10}
        showOutputButtons={true}
        defaultFileName="linguistic-annotation"
      />
    </Box>
  );
};

export default Turtle; 