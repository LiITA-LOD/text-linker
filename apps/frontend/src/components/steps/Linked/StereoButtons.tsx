import { Button, ButtonGroup, Tooltip } from '@mui/material';
import {
  SkipPrevious,
  SkipNext,
  FastRewind,
  FastForward,
} from '@mui/icons-material';
import React from 'react';
import type { ConlluDocument } from '../../../utils/conllu';
import { getLiITACount } from '../../../utils/liita';

interface StereoButtonsProps {
  parsedData: ConlluDocument | null;
  selectedSentenceIndex: number | null;
  selectedTokenIndex: number | undefined;
  onTokenSelect: (sentenceIndex: number, tokenIndex: number) => void;
}

const StereoButtons: React.FC<StereoButtonsProps> = ({
  parsedData,
  selectedSentenceIndex,
  selectedTokenIndex,
  onTokenSelect,
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
    if (currentTokenIndex > 0) {
      onTokenSelect(selectedSentenceIndex, currentTokenIndex - 1);
    }
  };

  const findNextToken = () => {
    if (currentTokenIndex < currentSentence.tokens.length - 1) {
      onTokenSelect(selectedSentenceIndex, currentTokenIndex + 1);
    }
  };

  const findPreviousUnlinkedOrAmbiguous = () => {
    // Search backwards from current position
    for (let i = currentTokenIndex - 1; i >= 0; i--) {
      const token = currentSentence.tokens[i];
      const linkCount = getLiITACount(token);
      if (linkCount === 0 || linkCount > 1) {
        onTokenSelect(selectedSentenceIndex, i);
        return;
      }
    }
  };

  const findNextUnlinkedOrAmbiguous = () => {
    // Search forwards from current position
    for (
      let i = currentTokenIndex + 1;
      i < currentSentence.tokens.length;
      i++
    ) {
      const token = currentSentence.tokens[i];
      const linkCount = getLiITACount(token);
      if (linkCount === 0 || linkCount > 1) {
        onTokenSelect(selectedSentenceIndex, i);
        return;
      }
    }
  };

  const isPreviousDisabled = currentTokenIndex === 0;
  const isNextDisabled =
    currentTokenIndex === currentSentence.tokens.length - 1;

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
