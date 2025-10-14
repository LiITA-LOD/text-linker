import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StepProps } from '../../types';
import {
  type ConlluDocument,
  type ConlluToken,
  parse,
  serialize as unparse,
} from '../../utils/conllu';
import { downloadSuggestionsCSV } from '../../utils/liita';
import InputActions from '../InputActions';
import DetailsModal from './Linked/DetailsModal';
import LinkingEditor from './Linked/LinkingEditor';
import ProgressIndicator from './Linked/ProgressIndicator';
import SentencePills from './Linked/SentencePills';
import StereoButtons from './Linked/StereoButtons';
import TokenInspector from './Linked/TokenInspector';

interface SectionHeadingProps {
  children: React.ReactNode;
  isFirst?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  isFirst = false,
}) => {
  const theme = useTheme();

  return (
    <h6
      style={{
        margin: isFirst ? '0 0 8px 0' : '16px 0 8px 0',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.divider,
        paddingBottom: '2px',
      }}
    >
      {children}
    </h6>
  );
};

const Linked: React.FC<StepProps> = ({ data, mergeWizardData }) => {
  const theme = useTheme();
  const [parsedData, setParsedData] = useState<ConlluDocument | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<
    number | undefined
  >();
  const [selectedToken, setSelectedToken] = useState<ConlluToken | null>(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<
    number | null
  >(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const sentencesContainerRef = useRef<HTMLDivElement>(null);

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

  // Update selectedToken when parsedData changes (e.g., after token updates)
  useEffect(() => {
    if (
      parsedData &&
      selectedSentenceIndex !== null &&
      selectedTokenIndex !== undefined
    ) {
      const sentence = parsedData.sentences[selectedSentenceIndex];
      if (sentence?.tokens[selectedTokenIndex]) {
        setSelectedToken(sentence.tokens[selectedTokenIndex]);
      }
    }
  }, [parsedData, selectedSentenceIndex, selectedTokenIndex]);

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

  const handleTokenUpdate = useCallback(
    (updatedToken: ConlluToken) => {
      if (
        !parsedData ||
        selectedSentenceIndex === null ||
        selectedTokenIndex === undefined
      ) {
        return;
      }

      // Create a deep copy of the parsed data
      const updatedParsedData = {
        ...parsedData,
        sentences: parsedData.sentences.map((sentence, sentenceIdx) => {
          if (sentenceIdx === selectedSentenceIndex) {
            return {
              ...sentence,
              tokens: sentence.tokens.map((token, tokenIdx) => {
                if (tokenIdx === selectedTokenIndex) {
                  return updatedToken;
                }
                return token;
              }),
            };
          }
          return sentence;
        }),
      };

      // Update the parsed data and serialize it
      setParsedData(updatedParsedData);
      const serializedData = unparse(updatedParsedData);
      mergeWizardData('linked', serializedData);
    },
    [parsedData, selectedSentenceIndex, selectedTokenIndex, mergeWizardData],
  );

  const handleMassTokenUpdate = useCallback(
    (tokenUpdates: Array<{
      sentenceIndex: number;
      tokenIndex: number;
      updatedToken: ConlluToken;
    }>) => {
      if (!parsedData) return;

      // Create a deep copy and apply all updates
      const updatedParsedData = {
        ...parsedData,
        sentences: parsedData.sentences.map((sentence, sentenceIdx) => ({
          ...sentence,
          tokens: sentence.tokens.map((token, tokenIdx) => {
            const update = tokenUpdates.find(
              u => u.sentenceIndex === sentenceIdx && u.tokenIndex === tokenIdx
            );
            return update ? update.updatedToken : token;
          })
        }))
      };

      setParsedData(updatedParsedData);
      const serializedData = unparse(updatedParsedData);
      mergeWizardData('linked', serializedData);
    },
    [parsedData, mergeWizardData]
  );

  const handleFocusToken = useCallback(() => {
    if (
      !sentencesContainerRef.current ||
      selectedSentenceIndex === null ||
      selectedTokenIndex === undefined ||
      !parsedData
    ) {
      return;
    }

    // Find the selected sentence element
    const sentenceElements = sentencesContainerRef.current.querySelectorAll(
      '[data-sentence-index]',
    );
    const targetSentenceElement = Array.from(sentenceElements).find(
      (el) =>
        el.getAttribute('data-sentence-index') ===
        selectedSentenceIndex.toString(),
    );

    if (targetSentenceElement) {
      // Scroll the sentence into view
      targetSentenceElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedSentenceIndex, selectedTokenIndex, parsedData]);

  const handleDownloadSuggestions = useCallback(() => {
    if (!parsedData) {
      alert('No data available to download.');
      return;
    }
    downloadSuggestionsCSV(parsedData, 'suggestions.csv');
  }, [parsedData]);

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
        fileTypes={[{ accept: { 'text/plain': ['.conllu'] } }]}
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
              flex: 1,
              overflow: 'hidden', // Prevent container overflow
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              ref={sentencesContainerRef}
              sx={{
                flex: 1,
                p: 1, // Add some padding for scrollbar and selection outline
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: theme.palette.action.hover,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.action.disabled,
                  borderRadius: '4px',
                  '&:hover': {
                    background: theme.palette.text.disabled,
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {parsedData.sentences.map((sentence, sentenceIndex) => {
                  return (
                    <Box
                      key={sentenceIndex}
                      data-sentence-index={sentenceIndex}
                    >
                      <SentencePills
                        sentence={sentence}
                        sentenceIndex={sentenceIndex}
                        selectedTokenIndex={
                          selectedSentenceIndex === sentenceIndex
                            ? selectedTokenIndex
                            : undefined
                        }
                        onTokenClick={handleTokenClick}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: { md: '300px' },
              maxWidth: { md: '400px' },
              pr: 2, // Add some padding for scrollbar
              overflowY: 'scroll',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.action.hover,
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.action.disabled,
                borderRadius: '4px',
                '&:hover': {
                  background: theme.palette.text.disabled,
                },
              },
            }}
          >
            <SectionHeading isFirst>Linking Progress</SectionHeading>
            <ProgressIndicator parsedData={parsedData} />

            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                If you added any, you can{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={handleDownloadSuggestions}
                  sx={{
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0,
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    color: 'primary.main',
                    textDecoration: 'underline',
                    verticalAlign: 'baseline',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                      color: 'primary.dark',
                    },
                  }}
                >
                  download all suggestions
                </Button>
                {' '}as CSV.
              </Typography>
            </Box>

            {selectedTokenIndex !== undefined && (
              <SectionHeading>Navigation Controls</SectionHeading>
            )}
            <StereoButtons
              parsedData={parsedData}
              selectedSentenceIndex={selectedSentenceIndex}
              selectedTokenIndex={selectedTokenIndex}
              onTokenSelect={handleTokenClick}
              onFocusToken={handleFocusToken}
            />

            {selectedToken && selectedSentenceIndex !== null && parsedData && (
              <>
                <SectionHeading>Selected Token</SectionHeading>
                <TokenInspector
                  token={selectedToken}
                  onInfoClick={() => setInfoModalOpen(true)}
                />
                <SectionHeading>Link Editor</SectionHeading>
                {!selectedToken.id.includes('-') && selectedToken.upos != "PUNCT" ? (
                  <LinkingEditor
                    token={selectedToken}
                    parsedData={parsedData}
                    sentenceIndex={selectedSentenceIndex}
                    tokenIndex={selectedTokenIndex}
                    onTokenUpdate={handleTokenUpdate}
                    onMassTokenUpdate={handleMassTokenUpdate}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 3,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      This token cannot be linked.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Details Modal */}
      <DetailsModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        token={selectedToken}
        sentence={
          selectedSentenceIndex !== null && parsedData
            ? parsedData.sentences[selectedSentenceIndex]
            : null
        }
        sentenceIndex={selectedSentenceIndex}
      />
    </Box>
  );
};

export default Linked;
