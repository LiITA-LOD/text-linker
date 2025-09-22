import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Typography } from '@mui/material';
import type React from 'react';
import type { ConlluToken } from '../../../utils/conllu';
import { getLinkedURIsValue, parseLinkedURIsValue } from '../../../utils/liita';

interface TokenInspectorProps {
  token: ConlluToken | null;
  onInfoClick?: () => void;
}

const TokenInspector: React.FC<TokenInspectorProps> = ({
  token,
  onInfoClick,
}) => {
  // Create token display text
  const getTokenDisplayText = () => {
    if (!token) return 'No token selected';

    const form = token.form || '_';
    const lemma = `(${token.lemma || '_'})`;
    const pos = `[${token.upos || '_'}]`;

    return `${form} ${lemma} ${pos}`;
  };

  // Get link count for display
  const getLinkCount = () => {
    if (!token) return 0;
    const liitaValue = getLinkedURIsValue(token);
    return parseLinkedURIsValue(liitaValue).length;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="h6">
        {getTokenDisplayText()} ({getLinkCount()} links)
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
  );
};

export default TokenInspector;
