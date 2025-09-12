import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TextField,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import type { ConlluToken } from '../../../utils/conllu';
import {
  getLiITAValue,
  parseLiITAValue,
  serializeLiITAValue,
  updateTokenLiITA,
} from '../../../utils/liita';

const LinkingDetails: React.FC<{
  token: ConlluToken | null;
  onTokenUpdate?: (updatedToken: ConlluToken) => void;
}> = React.memo(({ token, onTokenUpdate }) => {
  const [editingItems, setEditingItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState('');

  // Initialize editing state when token changes
  useEffect(() => {
    if (token) {
      const liitaValue = getLiITAValue(token);
      setEditingItems(parseLiITAValue(liitaValue));
      setIsEditing(false);
    }
  }, [token]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setEditingItems([...editingItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!token || !onTokenUpdate) return;

    const serializedValue = serializeLiITAValue(editingItems);
    const updatedToken = updateTokenLiITA(token, serializedValue);
    onTokenUpdate(updatedToken);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (token) {
      const liitaValue = getLiITAValue(token);
      setEditingItems(parseLiITAValue(liitaValue));
    }
    setIsEditing(false);
  };

  const liitaItems = parseLiITAValue(getLiITAValue(token));

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          Linking Details ({liitaItems.length} items)
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isEditing ? (
            <>
              {/* Editing Mode */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  LiITA Items:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {editingItems.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleRemoveItem(index)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              {/* Add new item */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add new item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem();
                    }
                  }}
                />
                <Button size="small" onClick={handleAddItem}>
                  Add
                </Button>
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={handleSave}>
                  Save
                </Button>
                <Button size="small" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  LiITA Items:
                </Typography>
                {liitaItems.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {liitaItems.map((item, index) => (
                      <Chip key={index} label={item} size="small" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No LiITA items
                  </Typography>
                )}
              </Box>

              <Button size="small" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

export default LinkingDetails;
