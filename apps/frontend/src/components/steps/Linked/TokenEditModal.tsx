import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { ConlluToken } from '../../../utils/conllu';

interface TokenEditModalProps {
  open: boolean;
  onClose: () => void;
  token: ConlluToken | null;
  onSave: (updatedToken: ConlluToken) => void;
}

// Common UPOS tags for dropdown
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

const TokenEditModal: React.FC<TokenEditModalProps> = ({
  open,
  onClose,
  token,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ConlluToken>>({});

  // Initialize form data when token changes
  useEffect(() => {
    if (token) {
      setFormData({
        id: token.id,
        form: token.form,
        lemma: token.lemma,
        upos: token.upos,
        xpos: token.xpos,
        head: token.head,
        deprel: token.deprel,
        deps: token.deps,
        feats: token.feats,
        misc: token.misc,
      });
    }
  }, [token]);

  const handleFieldChange = (field: keyof ConlluToken, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleFeatsChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      feats: {
        ...prev.feats,
        [key]: value || undefined,
      },
    }));
  };

  const handleFeatKeyChange = (oldKey: string, newKey: string) => {
    setFormData((prev) => {
      if (!prev.feats) return prev;
      const { [oldKey]: value, ...restFeats } = prev.feats;
      return {
        ...prev,
        feats: {
          ...restFeats,
          [newKey]: value,
        },
      };
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      feats: {
        ...prev.feats,
        '': '',
      },
    }));
  };

  const removeFeature = (key: string) => {
    setFormData((prev) => {
      if (!prev.feats) return prev;
      const { [key]: _, ...restFeats } = prev.feats;
      return {
        ...prev,
        feats: restFeats,
      };
    });
  };

  const handleMiscChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      misc: prev.misc?.map((item, i) => (i === index ? value : item)) || [
        value,
      ],
    }));
  };

  const addMisc = () => {
    setFormData((prev) => ({
      ...prev,
      misc: [...(prev.misc || []), ''],
    }));
  };

  const removeMisc = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      misc: prev.misc?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = () => {
    if (!token) return;

    const updatedToken: ConlluToken = {
      ...token,
      ...formData,
    };

    onSave(updatedToken);
    onClose();
  };

  const handleCancel = () => {
    // Reset form data to original token values
    if (token) {
      setFormData({
        id: token.id,
        form: token.form,
        lemma: token.lemma,
        upos: token.upos,
        xpos: token.xpos,
        head: token.head,
        deprel: token.deprel,
        deps: token.deps,
        feats: token.feats,
        misc: token.misc,
      });
    }
    onClose();
  };

  if (!token) return null;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Token</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Warning Notice */}
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> Be careful when modifying CONLLU data.
              Incorrect changes may break the linguistic analysis or cause
              parsing errors. Make sure you understand the CONLLU format before
              making modifications.
            </Typography>
          </Alert>

          {/* Basic Fields */}
          <TextField
            label="ID"
            value={formData.id || ''}
            fullWidth
            size="small"
            disabled
            helperText="ID cannot be modified"
          />

          <TextField
            label="FORM"
            value={formData.form || ''}
            onChange={(e) => handleFieldChange('form', e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="LEMMA"
            value={formData.lemma || ''}
            onChange={(e) => handleFieldChange('lemma', e.target.value)}
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>UPOS</InputLabel>
            <Select
              value={formData.upos || ''}
              onChange={(e) => handleFieldChange('upos', e.target.value)}
              label="UPOS"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {UPOS_TAGS.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="XPOS"
            value={formData.xpos || ''}
            onChange={(e) => handleFieldChange('xpos', e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="HEAD"
            value={formData.head || ''}
            onChange={(e) => handleFieldChange('head', e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="DEPREL"
            value={formData.deprel || ''}
            onChange={(e) => handleFieldChange('deprel', e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="DEPS"
            value={formData.deps || ''}
            onChange={(e) => handleFieldChange('deps', e.target.value)}
            fullWidth
            size="small"
          />

          {/* Features Section */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2">FEATS</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addFeature}
                size="small"
                variant="outlined"
                sx={{ minWidth: 'auto', py: 0.5, px: 1 }}
              >
                Add Feat
              </Button>
            </Box>
            {formData.feats && Object.keys(formData.feats).length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(formData.feats).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                  >
                    <TextField
                      label="Feature"
                      value={key}
                      onChange={(e) => handleFeatKeyChange(key, e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      value={value || ''}
                      onChange={(e) => handleFeatsChange(key, e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => removeFeature(key)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* MISC Section */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2">MISC</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addMisc}
                size="small"
                variant="outlined"
                sx={{ minWidth: 'auto', py: 0.5, px: 1 }}
              >
                Add MISC
              </Button>
            </Box>
            {formData.misc && formData.misc.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.misc.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                  >
                    <TextField
                      label={`MISC ${index + 1}`}
                      value={item || ''}
                      onChange={(e) => handleMiscChange(index, e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => removeMisc(index)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenEditModal;
