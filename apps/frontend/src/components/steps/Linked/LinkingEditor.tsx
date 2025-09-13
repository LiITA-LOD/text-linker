import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import type { ConlluToken } from '../../../utils/conllu';
import {
  getLiITAValue,
  parseLiITAValue,
  serializeLiITAValue,
  updateTokenLiITA,
} from '../../../utils/liita';

const LinkingEditor: React.FC<{
  token: ConlluToken | null;
  onTokenUpdate?: (updatedToken: ConlluToken) => void;
  onInfoClick?: () => void;
}> = React.memo(({ token, onTokenUpdate, onInfoClick }) => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // Initialize items when token changes
  useEffect(() => {
    if (token) {
      const liitaValue = getLiITAValue(token);
      setItems(parseLiITAValue(liitaValue));
    }
  }, [token]);

  const handleAddItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      const updatedItems = [...items, newItem.trim()];
      setItems(updatedItems);
      setNewItem('');
      updateToken(updatedItems);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    updateToken(updatedItems);
  };

  const updateToken = (updatedItems: string[]) => {
    if (!token || !onTokenUpdate) return;

    const serializedValue = serializeLiITAValue(updatedItems);
    const updatedToken = updateTokenLiITA(token, serializedValue);
    onTokenUpdate(updatedToken);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  // Create token display text
  const getTokenDisplayText = () => {
    if (!token) return 'No token selected';

    const form = token.form || '_';
    const lemma = `(${token.lemma || '_'})`;
    const pos = `[${token.upos || '_'}]`;

    return `${form} ${lemma} ${pos}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          {getTokenDisplayText()} ({items.length} links)
        </Typography>
        {onInfoClick && (
          <IconButton
            size="small"
            onClick={onInfoClick}
            sx={{ color: 'text.secondary' }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Add new item bar */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Add new link..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ flex: 1 }}
        />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          disabled={!newItem.trim() || items.includes(newItem.trim())}
        >
          Add
        </Button>
      </Box>

      {/* Links cards */}
      {items.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item, index) => (
            <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
              <CardContent sx={{ pr: 6, py: 1.5 }}>
                <Typography variant="body2">{item}</Typography>
              </CardContent>
              <IconButton
                size="small"
                onClick={() => handleRemoveItem(index)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Card>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 3,
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No links yet. Add one above to get started.
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default LinkingEditor;
