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
          Step 2: Input CoNLL-U
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the CoNLL-U format data for morphological and syntactic
          annotation.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
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
            <ListItemText primary="Type or paste CoNLL-U data directly (Ctrl+V)" />
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
            <ListItemText primary="Click 'Upload File' to select a CoNLL-U file" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DragIndicator color="primary" />
            </ListItemIcon>
            <ListItemText primary="Drag & drop a CoNLL-U file directly onto the text area" />
          </ListItem>
        </List>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, mb: 1 }}
        >
          <strong>CoNLL-U Format:</strong> Each line represents a token with
          tab-separated fields: ID, FORM, LEMMA, UPOS, XPOS, FEATS, HEAD,
          DEPREL, DEPS, MISC
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {`1	The	the	DET	DT	Definite=Def|PronType=Art	2	det	_	_
2	cat	cat	NOUN	NN	Number=Sing	3	nsubj	_	_
3	sat	sit	VERB	VBD	Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin	0	root	_	_`}
        </Box>
      </Box>
    </Paper>
  );
};

export default InputConllu;
