import { ContentPaste, DragIndicator, Edit, Upload } from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
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
        acceptFileTypes=".txt,.md,.html,.xml,.json"
        placeholder="Enter your text here or drag & drop a file..."
        dragPlaceholder="Drop your file here..."
        rows={8}
      />

      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          Input Methods
        </Typography>
        <List dense sx={{ py: 0 }}>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Edit color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Type or paste text directly (Ctrl+V)"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ContentPaste color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Use the 'Paste from Clipboard' button"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Upload color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Click 'Upload File' to select a file"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <DragIndicator color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Drag & drop a file directly onto the text area"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Supported file types:</strong> .txt, .md, .html, .xml, .json
        </Typography>
      </Box>
    </Box>
  );
};

export default InputText;
