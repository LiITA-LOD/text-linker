import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import React from 'react';
import type { ConlluToken } from '../../../utils/conllu';

const LinkingDetails: React.FC<{
  token: ConlluToken | null;
}> = React.memo(({ token }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">Linking Details</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box
          component="pre"
          sx={{
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {token?.misc?.find((misc) => misc.startsWith('LiITA=')) ?? '—'}
        </Box>
      </Box>
    </AccordionDetails>
  </Accordion>
));

export default LinkingDetails;
