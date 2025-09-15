import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Typography,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import type { ConlluToken } from '../../../utils/conllu';
import {
  getLiITAValue,
  parseLiITAValue,
  serializeLiITAValue,
  updateTokenLiITA,
} from '../../../utils/liita';
import { search, type SearchResult } from '../../../utils/sparql';
import LinkedEntityCard from './LinkedEntityCard';

const LinkingEditor: React.FC<{
  token: ConlluToken | null;
  onTokenUpdate?: (updatedToken: ConlluToken) => void;
  onInfoClick?: () => void;
}> = React.memo(({ token, onTokenUpdate, onInfoClick }) => {
  const [items, setItems] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Initialize items when token changes
  useEffect(() => {
    if (token) {
      const liitaValue = getLiITAValue(token);
      setItems(parseLiITAValue(liitaValue));
    }
  }, [token]);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, performSearch]);

  const handleAddItem = (selectedValue: string) => {
    if (selectedValue.trim() && !items.includes(selectedValue.trim())) {
      setSearchValue('');
      setSearchResults([]);
      const updatedItems = [...items, selectedValue.trim()];
      setItems(updatedItems);
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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

      <Autocomplete
        freeSolo
        options={searchResults}
        loading={loading}
        value={searchValue}
        onInputChange={(_, newValue) => setSearchValue(newValue)}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            handleAddItem(newValue);
          } else if (newValue) {
            handleAddItem(newValue.uri);
          }
        }}
        getOptionKey={(option) =>
          typeof option === 'string' ? option : option.uri
        }
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.label
        }
        loadingText="Loading..."
        noOptionsText="No results"
        filterOptions={(options) => options} // Disable local filtering since we're using remote search
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Search and add new link..."
          />
        )}
        renderOption={({ key, ...props }, option) => (
          <Box
            component="li"
            {...props}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {option.label}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight="bold">
                {option.upos}
              </Typography>
            </Box>
            {(() => {
              const otherForms = option.writtenRepresentations
                .filter((form) => form !== option.label)
                .slice(0, 3);
              return (
                otherForms.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      fontStyle: 'italic',
                    }}
                  >
                    {otherForms.join(', ')}
                    {option.writtenRepresentations.filter(
                      (form) => form !== option.label,
                    ).length > 3 && '...'}
                  </Typography>
                )
              );
            })()}
          </Box>
        )}
      />

      {/* Links cards */}
      {items.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item, index) => (
            <LinkedEntityCard
              key={index}
              uri={item}
              onRemove={() => handleRemoveItem(index)}
            />
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
