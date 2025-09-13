import {
  Box,
  Typography,
} from '@mui/material';
import React from 'react';
import type { ConlluSentence } from '../../../utils/conllu';

const SentenceDetails: React.FC<{
  sentenceIndex: number;
  sentence: ConlluSentence;
}> = React.memo(({ sentenceIndex, sentence }) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Sentence Details
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          ID:
        </Typography>
        <Typography variant="body2">{sentenceIndex + 1}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Token count:
        </Typography>
        <Typography variant="body2">{sentence.tokens.length}</Typography>
      </Box>
      {sentence.comments.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Comments:
          </Typography>
          <Box component="dl" sx={{ m: 0, pl: 1 }}>
            {sentence.comments.map((comment, commentIndex: number) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe for static lists
              <Box key={commentIndex} sx={{ mb: 0.5 }}>
                {comment.type === 'metadata' ? (
                  <>
                    <Box
                      component="dt"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      {comment.key}
                    </Box>
                    <Box component="dd" sx={{ ml: 1, fontSize: '0.875rem' }}>
                      {comment.value}
                    </Box>
                  </>
                ) : (
                  <Box
                    component="dd"
                    sx={{ fontSize: '0.875rem', fontStyle: 'italic' }}
                  >
                    {comment.text}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  </Box>
));

export default SentenceDetails;
