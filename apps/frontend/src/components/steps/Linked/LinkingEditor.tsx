import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import React, { useCallback, useEffect, useState } from 'react';
import type { ConlluToken, ConlluDocument } from '../../../utils/conllu';
import {
  applyLinksToTokens,
  findSimilarTokens,
  getLinkedURIsValue,
  parseLinkedURIsValue,
  serializeLinkedURIsValue,
  updateTokenLinkedURIs,
} from '../../../utils/liita';
import { type SearchResult, search } from '../../../utils/sparql';
import LinkedEntityCard from './LinkedEntityCard';

const LinkingEditor: React.FC<{
  token: ConlluToken | null;
  parsedData?: ConlluDocument;
  sentenceIndex?: number;
  tokenIndex?: number;
  onTokenUpdate?: (updatedToken: ConlluToken) => void;
  onMassTokenUpdate?: (tokenUpdates: Array<{
    sentenceIndex: number;
    tokenIndex: number;
    updatedToken: ConlluToken;
  }>) => void;
}> = React.memo(({ token, parsedData, sentenceIndex, tokenIndex, onTokenUpdate, onMassTokenUpdate }) => {
  const [items, setItems] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Initialize items when token changes
  useEffect(() => {
    if (token) {
      const liitaValue = getLinkedURIsValue(token);
      setItems(parseLinkedURIsValue(liitaValue));
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

    const serializedValue = serializeLinkedURIsValue(updatedItems);
    const updatedToken = updateTokenLinkedURIs(token, serializedValue);
    onTokenUpdate(updatedToken);
  };

  const handleCopyToSimilar = useCallback(() => {
    if (!token || !parsedData || !onMassTokenUpdate ||
      sentenceIndex === undefined || tokenIndex === undefined) {
      return;
    }

    // Find similar tokens (always by form + POS)
    const similarTokens = findSimilarTokens(
      token,
      parsedData,
      sentenceIndex,
      tokenIndex
    );

    if (similarTokens.length === 0) {
      alert('No similar tokens found (same form + POS).');
      return;
    }

    // Show confirmation dialog
    const linkText = items.length === 0 ? 'no links (unlink all)' : `${items.length} links`;
    const confirmed = window.confirm(
      `Copy ${linkText} to ${similarTokens.length} similar tokens?`
    );

    if (confirmed) {
      // Apply the same links to all similar tokens
      const tokenUpdates = applyLinksToTokens(similarTokens, items);
      onMassTokenUpdate(tokenUpdates);
    }
  }, [token, parsedData, onMassTokenUpdate, items, sentenceIndex, tokenIndex]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleCopyToSimilar}
        startIcon={<AutoFixHighIcon />}
        fullWidth
        title="Copy links to all tokens with the same form and part of speech"
      >
        Copy links to similar tokens
      </Button>

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
