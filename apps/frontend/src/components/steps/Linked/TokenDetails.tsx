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

const TokenDetails: React.FC<{
  token: ConlluToken;
}> = React.memo(({ token }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">Token Details</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            ID:
          </Typography>
          <Typography variant="body2">{token.id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            FORM:
          </Typography>
          <Typography variant="body2">{token.form ?? '—'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            LEMMA:
          </Typography>
          <Typography variant="body2">{token.lemma ?? '—'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            UPOS:
          </Typography>
          <Typography variant="body2">{token.upos ?? '—'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            XPOS:
          </Typography>
          <Typography variant="body2">{token.xpos ?? '—'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            HEAD:
          </Typography>
          <Typography variant="body2">{token.head ?? '—'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            DEPREL:
          </Typography>
          <Typography variant="body2">{token.deprel ?? '—'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            DEPS:
          </Typography>
          <Typography variant="body2">{token.deps ?? '—'}</Typography>
        </Box>
        {token.feats && Object.keys(token.feats).length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              FEATS:
            </Typography>
            <Box component="dl" sx={{ m: 0, pl: 1 }}>
              {Object.entries(token.feats).map(([key, value], featureIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe for static lists
                <Box key={featureIndex} sx={{ mb: 0.5 }}>
                  <Box
                    component="dt"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                    }}
                  >
                    {key}
                  </Box>
                  <Box component="dd" sx={{ ml: 1, fontSize: '0.875rem' }}>
                    {value ?? '—'}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        {token.misc && token.misc.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              MISC:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 1 }}>
              {token.misc.map((miscItem, miscIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe for static lists
                <Box key={miscIndex} component="li" sx={{ mb: 0.5, ml: 2 }}>
                  <Typography variant="body2">{miscItem ?? '—'}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </AccordionDetails>
  </Accordion>
));

export default TokenDetails;
