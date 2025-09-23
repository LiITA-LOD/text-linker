import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
    const theme = useTheme();
    console.debug(`TokenPill render: S${sentenceIndex} T${tokenIndex}`);

    const handleClick = () => {
      onTokenClick(sentenceIndex, tokenIndex);
    };

    const isOther = token.id.includes('-') || token.upos == "PUNCT";
    const linksCount = getLinkedURIsCount(token);

    return (
      <Chip
        label={token.form}
        onClick={handleClick}
        variant="filled"
        color={
          isOther
            ? 'default'
            : linksCount < 1
              ? 'warning'
              : linksCount > 1
                ? 'error'
                : 'success'
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
            outlineColor: theme.palette.primary.main,
          },
          ...(isSelected && {
            outlineWidth: '2px',
            outlineStyle: 'solid',
            outlineColor: theme.palette.primary.main,
            animation: 'dash 600ms ease-out infinite',
            '@keyframes dash': {
              '0%': {
                outlineOffset: '0px',
                outlineWidth: '4px',
              },
              '100%': {
                outlineOffset: '3px',
                outlineWidth: '1px',
              },
            },
          }),
        }}
      />
    );
  },
);

export default TokenPill;
