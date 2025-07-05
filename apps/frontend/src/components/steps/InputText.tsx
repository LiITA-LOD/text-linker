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
          Step 1: Input Text
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the text you want to annotate with linguistic data.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
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
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Input Methods:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Edit color="primary" />
            </ListItemIcon>
            <ListItemText primary="Type or paste text directly (Ctrl+V)" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ContentPaste color="primary" />
            </ListItemIcon>
            <ListItemText primary="Use the 'Paste from Clipboard' button" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Upload color="primary" />
            </ListItemIcon>
            <ListItemText primary="Click 'Upload File' to select a file" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DragIndicator color="primary" />
            </ListItemIcon>
            <ListItemText primary="Drag & drop a file directly onto the text area" />
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Supported file types:</strong> .txt, .md, .html, .xml, .json
        </Typography>
      </Box>
    </Paper>
  );
};

export default InputText;
