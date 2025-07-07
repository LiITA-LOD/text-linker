import { Chip } from '@mui/material';
import React from 'react';
import type { ConlluToken } from '../../../utils/conllu';

interface TokenPillProps {
  token: ConlluToken;
  tokenIndex: number;
  sentenceIndex: number;
  isSelected: boolean;
  onTokenClick: (sentenceIndex: number, tokenIndex: number) => void;
}

const TokenPill: React.FC<TokenPillProps> = React.memo(({
  token,
  tokenIndex,
  sentenceIndex,
  isSelected,
  onTokenClick,
}) => {
  console.debug(`TokenPill render: S${sentenceIndex} T${tokenIndex}`);

  const handleClick = () => {
    onTokenClick(sentenceIndex, tokenIndex);
  };

  const isMultiword = token.id.includes('-');
  const isPunctuation = /^[.,!?;:]$/.test(token.form);
  const isBracket = /^[\(\)\[\]\{\}""'']$/.test(token.form);

  return (
    <Chip
      label={token.form}
      onClick={handleClick}
      variant={isSelected ? 'filled' : 'outlined'}
      color={isSelected ? 'primary' : 'default'}
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
  );
});

export default TokenPill;
