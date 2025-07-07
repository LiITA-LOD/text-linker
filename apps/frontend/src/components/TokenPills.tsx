import { Box, Chip, Typography } from '@mui/material';
import React from 'react';
import type { ConlluSentence, ConlluToken } from '../utils/conllu';

interface TokenPillsProps {
  sentence: ConlluSentence;
  sentenceIndex: number;
  onTokenClick?: (token: ConlluToken, sentenceIndex: number, tokenIndex: number) => void;
  selectedTokenKey?: string; // Format: "sentenceIndex:tokenIndex"
}

const TokenPills: React.FC<TokenPillsProps> = ({
  sentence,
  sentenceIndex,
  onTokenClick,
  selectedTokenKey,
}) => {
  const handleTokenClick = (token: ConlluToken, tokenIndex: number) => {
    onTokenClick?.(token, sentenceIndex, tokenIndex);
  };

  // Helper function to determine if we need space before a token
  const needsSpaceBefore = (token: ConlluToken, index: number): boolean => {
    if (index === 0) return false;

    const currentForm = token.form;
    const prevToken = sentence.tokens[index - 1];

    // Don't add space before punctuation
    if (/^[.,!?;:]$/.test(currentForm)) return false;

    // Don't add space after opening brackets/quotes
    if (/^[\(\[\{""'']$/.test(prevToken.form)) return false;

    // Don't add space before closing brackets/quotes
    if (/^[\)\]\}""'']$/.test(currentForm)) return false;

    return true;
  };

  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      lineHeight: 1.6,
      fontSize: '1rem',
      fontFamily: 'inherit',
      rowGap: '4px'
    }}>
      {sentence.tokens.map((token, tokenIndex) => {
        const currentTokenKey = `${sentenceIndex}:${tokenIndex}`;
        const isSelected = selectedTokenKey === currentTokenKey;
        const isMultiword = token.id.includes('-');
        const isEmptyNode = token.id.includes('.');
        const isPunctuation = /^[.,!?;:]$/.test(token.form);
        const isBracket = /^[\(\)\[\]\{\}""'']$/.test(token.form);

        // Skip empty nodes in visual display
        if (isEmptyNode) {
          return null;
        }

        return (
          <React.Fragment key={`${token.id}-${tokenIndex}`}>
            {needsSpaceBefore(token, tokenIndex) && (
              <Box component="span" sx={{ width: '0.25em' }} />
            )}
            <Chip
              label={token.form}
              onClick={() => handleTokenClick(token, tokenIndex)}
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
              size="small"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                fontSize: 'inherit',
                height: 'auto',
                padding: '2px 6px',
                '& .MuiChip-label': {
                  padding: '0',
                  fontSize: 'inherit',
                },
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
                ...(isMultiword && {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                }),
                ...(isPunctuation && {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                  },
                }),
                ...(isBracket && {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                  },
                }),
                ...(isSelected && {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }),
              }}
            />
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default TokenPills;
