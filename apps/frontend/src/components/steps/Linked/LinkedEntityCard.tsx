import LinkOffIcon from '@mui/icons-material/LinkOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { getAllPredicates } from '../../../utils/sparql';

interface LinkedEntityCardProps {
  uri: string;
  onRemove: () => void;
}

const LinkedEntityCard: React.FC<LinkedEntityCardProps> = ({ uri, onRemove }) => {
  const [predicates, setPredicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Helper function to extract the last fragment from a URI
  const extractFragment = (uri: string): string => {
    return uri.split("#").pop()!.split("/").pop() || uri;
  };

  // Helper function to render a value (URI or literal) with appropriate styling
  const renderValue = (value: any) => {
    if (value.type === 'uri') {
      return (
        <Link
          href={value.value}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {extractFragment(value.value)}
          <OpenInNewIcon sx={{ fontSize: 12 }} />
        </Link>
      );
    }
    return value.value;
  };

  useEffect(() => {
    const fetchPredicates = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getAllPredicates(uri);
        setPredicates(data);
      } catch (err) {
        console.error(`Failed to fetch predicates for ${uri}:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPredicates();
  }, [uri]);

  // Format predicate data for display
  const formatPredicateData = (predicates: any[]) => {
    if (!predicates || predicates.length === 0) return null;

    // Group predicates by type and show all predicates
    const groupedPredicates = predicates.reduce((acc, binding) => {
      const predicate = binding.predicate;
      const object = binding.object;

      if (predicate && object) {
        const predicateName = extractFragment(predicate.value);
        if (!acc[predicateName]) {
          acc[predicateName] = [];
        }
        acc[predicateName].push(object);
      }
      return acc;
    }, {} as Record<string, any[]>);

    return groupedPredicates;
  };

  const formattedPredicates = formatPredicateData(predicates);
  const entityName = uri.split('/').pop() || uri.split('#').pop() || uri;

  return (
    <Card variant="outlined" sx={{ position: 'relative' }}>
      <CardContent sx={{ pr: 6, py: 1.5 }}>
        <Link
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            textDecoration: 'none',
            mb: 1,
            fontWeight: 'medium',
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {entityName}
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Link>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={12} />
            <Typography variant="caption" color="text.secondary">
              Loading predicates...
            </Typography>
          </Box>
        ) : error ? (
          <Typography variant="caption" color="error">
            Failed to load predicates
          </Typography>
        ) : formattedPredicates ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}>
            {Object.entries(formattedPredicates).map(([predicate, values]) => {
              // Check if the predicate name is actually a URI fragment
              const predicateBinding = predicates.find(p =>
                extractFragment(p.predicate?.value || '') === predicate
              );
              const isPredicateUri = predicateBinding?.predicate?.type === 'uri';
              const predicateUri = predicateBinding?.predicate?.value;

              return (
                <Box key={predicate} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    {isPredicateUri && predicateUri ? (
                      <Link
                        href={predicateUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          textDecoration: 'none',
                          color: 'text.secondary',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {predicate}:
                        <OpenInNewIcon sx={{ fontSize: 12 }} />
                      </Link>
                    ) : (
                      `${predicate}:`
                    )}
                  </Typography>
                <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {values.map((value, index) => (
                    <Typography key={index} variant="body2">
                      {renderValue(value)}
                    </Typography>
                  ))}
                </Box>
              </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No predicate data available
          </Typography>
        )}
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
        title="Unlink entity"
      >
        <LinkOffIcon fontSize="small" />
      </IconButton>
    </Card>
  );
};

export default LinkedEntityCard;
