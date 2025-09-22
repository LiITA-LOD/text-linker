import { Button, ButtonGroup, Tooltip } from '@mui/material';
import {
  SkipPrevious,
  SkipNext,
  FastRewind,
  FastForward,
  CenterFocusStrong,
} from '@mui/icons-material';
import React from 'react';
import type { ConlluDocument } from '../../../utils/conllu';
import { getLinkedURIsCount } from '../../../utils/liita';

interface StereoButtonsProps {
  parsedData: ConlluDocument | null;
  selectedSentenceIndex: number | null;
  selectedTokenIndex: number | undefined;
  onTokenSelect: (sentenceIndex: number, tokenIndex: number) => void;
  onFocusToken?: () => void;
}

const StereoButtons: React.FC<StereoButtonsProps> = ({
  parsedData,
  selectedSentenceIndex,
  selectedTokenIndex,
  onTokenSelect,
  onFocusToken,
}) => {
  if (
    !parsedData ||
    selectedSentenceIndex === null ||
    selectedTokenIndex === undefined
  ) {
    return null;
  }

  const currentSentence = parsedData.sentences[selectedSentenceIndex];
  const currentTokenIndex = selectedTokenIndex;

  const findPreviousToken = () => {
    // Try previous token in current sentence
    if (currentTokenIndex > 0) {
      onTokenSelect(selectedSentenceIndex, currentTokenIndex - 1);
      return;
    }

    // Try last token of previous sentence
    if (selectedSentenceIndex > 0) {
      const prevSentence = parsedData.sentences[selectedSentenceIndex - 1];
      if (prevSentence.tokens.length > 0) {
        onTokenSelect(
          selectedSentenceIndex - 1,
          prevSentence.tokens.length - 1,
        );
      }
    }
  };

  const findNextToken = () => {
    // Try next token in current sentence
    if (currentTokenIndex < currentSentence.tokens.length - 1) {
      onTokenSelect(selectedSentenceIndex, currentTokenIndex + 1);
      return;
    }

    // Try first token of next sentence
    if (selectedSentenceIndex < parsedData.sentences.length - 1) {
      onTokenSelect(selectedSentenceIndex + 1, 0);
    }
  };

  const findPreviousUnlinkedOrAmbiguous = () => {
    // Search backwards from current position in current sentence
    for (let i = currentTokenIndex - 1; i >= 0; i--) {
      const token = currentSentence.tokens[i];
      
      // Skip "other" category tokens (same logic as TokenPill)
      const isMultiword = token.id.includes('-');
      const isPunctuation = /^[.,!?;:]$/.test(token.form);
      const isBracket = /^[()[\]{}""'']$/.test(token.form);
      const isOther = isBracket || isMultiword || isPunctuation;
      
      if (!isOther) {
        const linkCount = getLinkedURIsCount(token);
        if (linkCount === 0 || linkCount > 1) {
          onTokenSelect(selectedSentenceIndex, i);
          return;
        }
      }
    }

    // Search backwards in previous sentences
    for (
      let sentenceIdx = selectedSentenceIndex - 1;
      sentenceIdx >= 0;
      sentenceIdx--
    ) {
      const sentence = parsedData.sentences[sentenceIdx];
      for (
        let tokenIdx = sentence.tokens.length - 1;
        tokenIdx >= 0;
        tokenIdx--
      ) {
        const token = sentence.tokens[tokenIdx];
        
        // Skip "other" category tokens (same logic as TokenPill)
        const isMultiword = token.id.includes('-');
        const isPunctuation = /^[.,!?;:]$/.test(token.form);
        const isBracket = /^[()[\]{}""'']$/.test(token.form);
        const isOther = isBracket || isMultiword || isPunctuation;
        
        if (!isOther) {
          const linkCount = getLinkedURIsCount(token);
          if (linkCount === 0 || linkCount > 1) {
            onTokenSelect(sentenceIdx, tokenIdx);
            return;
          }
        }
      }
    }
  };

  const findNextUnlinkedOrAmbiguous = () => {
    // Search forwards from current position in current sentence
    for (
      let i = currentTokenIndex + 1;
      i < currentSentence.tokens.length;
      i++
    ) {
      const token = currentSentence.tokens[i];
      
      // Skip "other" category tokens (same logic as TokenPill)
      const isMultiword = token.id.includes('-');
      const isPunctuation = /^[.,!?;:]$/.test(token.form);
      const isBracket = /^[()[\]{}""'']$/.test(token.form);
      const isOther = isBracket || isMultiword || isPunctuation;
      
      if (!isOther) {
        const linkCount = getLinkedURIsCount(token);
        if (linkCount === 0 || linkCount > 1) {
          onTokenSelect(selectedSentenceIndex, i);
          return;
        }
      }
    }

    // Search forwards in next sentences
    for (
      let sentenceIdx = selectedSentenceIndex + 1;
      sentenceIdx < parsedData.sentences.length;
      sentenceIdx++
    ) {
      const sentence = parsedData.sentences[sentenceIdx];
      for (let tokenIdx = 0; tokenIdx < sentence.tokens.length; tokenIdx++) {
        const token = sentence.tokens[tokenIdx];
        
        // Skip "other" category tokens (same logic as TokenPill)
        const isMultiword = token.id.includes('-');
        const isPunctuation = /^[.,!?;:]$/.test(token.form);
        const isBracket = /^[()[\]{}""'']$/.test(token.form);
        const isOther = isBracket || isMultiword || isPunctuation;
        
        if (!isOther) {
          const linkCount = getLinkedURIsCount(token);
          if (linkCount === 0 || linkCount > 1) {
            onTokenSelect(sentenceIdx, tokenIdx);
            return;
          }
        }
      }
    }
  };

  const isPreviousDisabled =
    currentTokenIndex === 0 && selectedSentenceIndex === 0;
  const isNextDisabled =
    currentTokenIndex === currentSentence.tokens.length - 1 &&
    selectedSentenceIndex === parsedData.sentences.length - 1;

  return (
    <ButtonGroup
      variant="contained"
      size="large"
      sx={{
        width: '100%',
        '& .MuiButton-root': {
          flex: 1,
          maxHeight: 40,
        },
      }}
    >
      <Tooltip title="Previous issue">
        <Button
          onClick={findPreviousUnlinkedOrAmbiguous}
          disabled={isPreviousDisabled}
        >
          <SkipPrevious sx={{ fontSize: 32 }} />
        </Button>
      </Tooltip>

      <Tooltip title="Previous token">
        <Button onClick={findPreviousToken} disabled={isPreviousDisabled}>
          <FastRewind sx={{ fontSize: 32 }} />
        </Button>
      </Tooltip>

      <Tooltip title="Focus selection">
        <Button
          onClick={onFocusToken}
          sx={{
            backgroundColor: 'primary.dark',
            '&:hover': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <CenterFocusStrong sx={{ fontSize: 32 }} />
        </Button>
      </Tooltip>

      <Tooltip title="Next token">
        <Button onClick={findNextToken} disabled={isNextDisabled}>
          <FastForward sx={{ fontSize: 32 }} />
        </Button>
      </Tooltip>

      <Tooltip title="Next issue">
        <Button onClick={findNextUnlinkedOrAmbiguous} disabled={isNextDisabled}>
          <SkipNext sx={{ fontSize: 32 }} />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default StereoButtons;
