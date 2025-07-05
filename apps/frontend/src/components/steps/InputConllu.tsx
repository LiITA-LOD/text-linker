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

const InputConllu: React.FC<StepProps> = ({ data, onDataChange }) => {
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
          Enter the CoNLL-U format data for morphological and syntactic annotation.
        </Typography>
      </Box>

      <InputActions
        onDataChange={onDataChange}
        dataKey="conllu"
        value={data.conllu || ''}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        acceptFileTypes=".conllu,.txt,.tsv"
        placeholder="Enter CoNLL-U format data here or drag & drop a file..."
        dragPlaceholder="Drop your CoNLL-U file here..."
        rows={10}
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
              primary="Type or paste CoNLL-U data directly (Ctrl+V)"
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
              primary="Click 'Upload File' to select a CoNLL-U file"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <DragIndicator color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Drag & drop a CoNLL-U file directly onto the text area"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          <strong>CoNLL-U Format:</strong> Each line represents a token with tab-separated fields: ID, FORM, LEMMA, UPOS, XPOS, FEATS, HEAD, DEPREL, DEPS, MISC
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Supported file types:</strong> .conllu, .txt, .tsv
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Example:</strong>
        </Typography>
        
        <Box
          component="pre"
          sx={{
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            color: '#cbd5e1',
            lineHeight: 1.4,
          }}
        >
          {`1	The	the	DET	DT	Definite=Def|PronType=Art	2	det	_	_
2	cat	cat	NOUN	NN	Number=Sing	3	nsubj	_	_
3	sat	sit	VERB	VBD	Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin	0	root	_	_`}
        </Box>
      </Box>
    </Box>
  );
};

export default InputConllu;
