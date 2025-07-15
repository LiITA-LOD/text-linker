import { Box } from '@mui/material';
import React from 'react';
import type { ConlluSentence } from '../../../utils/conllu';
import TokenPill from './TokenPill';

interface SentencePillsProps {
  sentence: ConlluSentence;
  sentenceIndex: number;
  onTokenClick: (sentenceIndex: number, tokenIndex: number) => void;
  selectedTokenIndex: number | undefined;
}

const SentencePills: React.FC<SentencePillsProps> = React.memo(
  ({ sentence, sentenceIndex, onTokenClick, selectedTokenIndex }) => {
    console.debug(`SentencePills render: S${sentenceIndex}`);

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          lineHeight: 1.6,
          fontSize: '1rem',
          fontFamily: 'inherit',
          rowGap: '4px',
          columnGap: '4px',
        }}
      >
        {sentence.tokens.map((token, tokenIndex) => (
          <TokenPill
            key={token.id}
            token={token}
            tokenIndex={tokenIndex}
            sentenceIndex={sentenceIndex}
            isSelected={selectedTokenIndex === tokenIndex}
            onTokenClick={onTokenClick}
          />
        ))}
      </Box>
    );
  },
);

export default SentencePills;
