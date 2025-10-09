import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import type React from 'react';
import type { EntitySuggestion } from '../../../utils/liita';

interface SuggestionCardProps {
  suggestion: EntitySuggestion;
  onRemove: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onRemove,
}) => {
  return (
    <Card variant="outlined" sx={{ position: 'relative' }}>
      <CardContent sx={{ pr: 6, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              backgroundColor: 'warning.main',
              color: 'warning.contrastText',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          >
            SUGGESTION
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 'bold' }}
            >
              Label:
            </Typography>
            <Box
              sx={{
                ml: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
              }}
            >
              <Typography variant="body2">{suggestion.label}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 'bold' }}
            >
              UPOS:
            </Typography>
            <Box
              sx={{
                ml: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
              }}
            >
              <Typography variant="body2">{suggestion.upostag}</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          color: 'error.main',
          '&:hover': {
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          },
        }}
        title="Remove suggestion"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Card>
  );
};

export default SuggestionCard;
