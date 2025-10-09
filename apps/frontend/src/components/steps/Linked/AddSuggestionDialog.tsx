import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import type { EntitySuggestion } from '../../../utils/liita';

const UPOS_TAGS = [
  'ADJ',
  'ADP',
  'ADV',
  'AUX',
  'CCONJ',
  'DET',
  'INTJ',
  'NOUN',
  'NUM',
  'PART',
  'PRON',
  'PROPN',
  'PUNCT',
  'SCONJ',
  'SYM',
  'VERB',
  'X',
];

interface AddSuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (suggestion: EntitySuggestion) => void;
  tokenForm?: string;
  tokenUpos?: string;
}

const AddSuggestionDialog: React.FC<AddSuggestionDialogProps> = ({
  open,
  onClose,
  onAdd,
  tokenForm,
  tokenUpos,
}) => {
  const [label, setLabel] = useState(tokenForm || '');
  const [upostag, setUpostag] = useState(tokenUpos || '');

  const handleSubmit = () => {
    if (!label.trim() || !upostag) return;

    const suggestion: EntitySuggestion = {
      label: label.trim(),
      upostag: upostag,
    };

    onAdd(suggestion);

    // Reset form
    setLabel(tokenForm || '');
    setUpostag(tokenUpos || '');

    onClose();
  };

  const handleClose = () => {
    // Reset form
    setLabel(tokenForm || '');
    setUpostag(tokenUpos || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New suggestion</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Label *"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Entity name or label"
            fullWidth
            required
          />

          <FormControl fullWidth required>
            <InputLabel>UPOS Tag</InputLabel>
            <Select
              value={upostag}
              onChange={(e) => setUpostag(e.target.value)}
              label="UPOS Tag"
            >
              {UPOS_TAGS.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!label.trim() || !upostag}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSuggestionDialog;
