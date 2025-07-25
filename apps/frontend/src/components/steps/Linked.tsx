import { Box, Typography } from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StepProps } from '../../types';
import {
  type ConlluDocument,
  type ConlluToken,
  parse,
  serialize as unparse,
} from '../../utils/conllu';
import InputActions from '../InputActions';
import SentenceDetails from './Linked/SentenceDetails';
import SentencePills from './Linked/SentencePills';
import TokenDetails from './Linked/TokenDetails';

const Linked: React.FC<StepProps> = ({ data, mergeWizardData }) => {
  const [parsedData, setParsedData] = useState<ConlluDocument | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<
    number | undefined
  >();
  const [selectedToken, setSelectedToken] = useState<ConlluToken | null>(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (data.linked) {
      try {
        setParsedData(parse(data.linked));
      } catch (error) {
        console.error('Error parsing linking data:', error);
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  }, [data.linked]);

  // Memoize the serialized data to prevent expensive unparse calls on every render
  const serializedData = useMemo(() => {
    return parsedData ? unparse(parsedData) : '';
  }, [parsedData]);

  const handleTokenClick = useCallback(
    (sentenceIndex: number, tokenIndex: number) => {
      if (!parsedData) return;
      const sentence = parsedData.sentences[sentenceIndex];
      if (!sentence || !sentence.tokens[tokenIndex]) return;
      const token = sentence.tokens[tokenIndex];
      setSelectedTokenIndex((prevIndex) => {
        if (prevIndex === tokenIndex) {
          setSelectedToken(null);
          setSelectedSentenceIndex(null);
          return undefined;
        } else {
          setSelectedToken(token);
          setSelectedSentenceIndex(sentenceIndex);
          return tokenIndex;
        }
      });
    },
    [parsedData],
  );

  const handleDataChange = (value: string) => {
    try {
      setParsedData(parse(value));
      mergeWizardData('linked', value);
    } catch (error) {
      console.error('Error parsing input data:', error);
      setParsedData(null);
      mergeWizardData('linked', null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
          Step 3: Input Linking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and edit the linking data automatically generated by the
          prelinker service.
        </Typography>
      </Box>

      <InputActions
        acceptFileTypes=".conllu"
        defaultFileName="input-linking"
        dragPlaceholder="Drop your linking file here..."
        onDataChange={handleDataChange}
        placeholder="Enter your annotated CoNLL-U data here or drag & drop a file..."
        rows={10}
        showOutputButtons={true}
        showTextField={false}
        value={serializedData}
      />

      {/* Token Pills Display */}
      {parsedData && parsedData.sentences.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            height: '600px', // Fixed height for the container
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Scrollable Sentences Section */}
          <Box
            sx={{
              flex: selectedToken ? 2 : 1,
              overflow: 'hidden', // Prevent container overflow
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                overflowY: 'auto', // Make this section scrollable
                flex: 1,
                pr: 1, // Add some padding for scrollbar
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#a8a8a8',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {parsedData.sentences.map((sentence, sentenceIndex) => {
                  return (
                    <SentencePills
                      // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe for static lists
                      key={sentenceIndex}
                      sentence={sentence}
                      sentenceIndex={sentenceIndex}
                      selectedTokenIndex={
                        selectedSentenceIndex === sentenceIndex
                          ? selectedTokenIndex
                          : undefined
                      }
                      onTokenClick={handleTokenClick}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>

          {selectedToken && selectedSentenceIndex !== null && parsedData && (
            <Box
              sx={{
                flex: 1,
                minWidth: { md: '300px' },
                maxWidth: { md: '400px' },
                overflowY: 'auto', // Make details section scrollable too
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#a8a8a8',
                  },
                },
              }}
            >
              <SentenceDetails
                sentenceIndex={selectedSentenceIndex}
                sentence={parsedData.sentences[selectedSentenceIndex]}
              />
              <TokenDetails token={selectedToken} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Linked;
