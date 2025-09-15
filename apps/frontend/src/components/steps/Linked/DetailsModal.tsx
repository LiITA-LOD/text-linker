import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
} from '@mui/material';
import type React from 'react';
import type { ConlluSentence, ConlluToken } from '../../../utils/conllu';
import SentenceDetails from './SentenceDetails';
import TokenDetails from './TokenDetails';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  token: ConlluToken | null;
  sentence: ConlluSentence | null;
  sentenceIndex: number | null;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  open,
  onClose,
  token,
  sentence,
  sentenceIndex,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Sentence Details */}
          {sentence && sentenceIndex !== null && (
            <SentenceDetails
              sentenceIndex={sentenceIndex}
              sentence={sentence}
            />
          )}

          {/* Divider */}
          {sentence && token && <Divider />}

          {/* Token Details */}
          {token && <TokenDetails token={token} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailsModal;
