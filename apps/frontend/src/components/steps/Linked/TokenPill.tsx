import { Chip } from '@mui/material';
import React from 'react';
import type { ConlluToken } from '../../../utils/conllu';
import { getLinkedURIsCount } from '../../../utils/liita';

interface TokenPillProps {
  token: ConlluToken;
  tokenIndex: number;
  sentenceIndex: number;
  isSelected: boolean;
  onTokenClick: (sentenceIndex: number, tokenIndex: number) => void;
}

const TokenPill: React.FC<TokenPillProps> = React.memo(
  ({ token, tokenIndex, sentenceIndex, isSelected, onTokenClick }) => {
    console.debug(`TokenPill render: S${sentenceIndex} T${tokenIndex}`);

    const handleClick = () => {
      onTokenClick(sentenceIndex, tokenIndex);
    };

    const isMultiword = token.id.includes('-');
    const isPunctuation = /^[.,!?;:]$/.test(token.form);
    const isBracket = /^[()[\]{}""'']$/.test(token.form);
    const linksCount = getLinkedURIsCount(token);

    return (
      <Chip
        label={token.form}
        onClick={handleClick}
        variant="filled"
        color={
          isBracket || isMultiword || isPunctuation
            ? 'secondary'
            : linksCount < 1
              ? 'warning'
              : linksCount > 1
                ? 'error'
                : 'default'
        }
        sx={{
          cursor: 'pointer',
          fontSize: 'inherit',
          height: 'auto',
          padding: '2px 6px',
          '& .MuiChip-label': {
            padding: '0',
            fontSize: 'inherit',
          },
          '&:hover': {
            outlineWidth: '2px',
            outlineStyle: 'solid',
            outlineColor: 'white',
          },
          ...(isSelected && {
            outlineWidth: '2px',
            outlineStyle: 'solid',
            outlineColor: 'white',
          }),
        }}
      />
    );
  },
);

export default TokenPill;
