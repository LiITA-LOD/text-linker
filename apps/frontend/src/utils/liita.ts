import type { ConlluDocument, ConlluToken } from './conllu';

const LINKEDURIS_MISC_KEY = 'LiITALinkedURIs'; // TODO: rename to LiITALinkedURIs here and in backend
const SUGGESTION_MISC_KEY = 'LiITASuggestion';

/**
 * Extract linked URIs value from token's misc field
 * Returns the comma-separated string value, or null if not found
 */
export function getLinkedURIsValue(token: ConlluToken | null): string | null {
  if (!token?.misc) return null;

  const liitaItem = token.misc.find((misc) =>
    misc.startsWith(`${LINKEDURIS_MISC_KEY}=`),
  );
  if (!liitaItem) return null;

  return liitaItem.substring(LINKEDURIS_MISC_KEY.length + 1); // Remove prefix
}

/**
 * Parse linked URIs value into array of strings
 * Returns empty array if value is null or empty
 */
export function parseLinkedURIsValue(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If JSON parsing fails, return empty array
    return [];
  }
}

/**
 * Serialize array of strings back to linked URIs value format
 */
export function serializeLinkedURIsValue(items: string[]): string {
  return JSON.stringify(items);
}

/**
 * Update token's misc field with new linked URIs value
 * Creates linked URIs entry if it doesn't exist, updates if it does
 */
export function updateTokenLinkedURIs(
  token: ConlluToken,
  newValue: string,
): ConlluToken {
  const updatedMisc = [...(token.misc || [])];
  const liitaIndex = updatedMisc.findIndex((misc) =>
    misc.startsWith(`${LINKEDURIS_MISC_KEY}=`),
  );

  const liitaEntry = `${LINKEDURIS_MISC_KEY}=${newValue}`;

  if (liitaIndex >= 0) {
    // Update existing linked URIs entry
    updatedMisc[liitaIndex] = liitaEntry;
  } else {
    // Add new linked URIs entry
    updatedMisc.push(liitaEntry);
  }

  return {
    ...token,
    misc: updatedMisc.length > 0 ? updatedMisc : undefined,
  };
}

/**
 * Remove linked URIs entry from token's misc field
 */
export function removeTokenLinkedURIs(token: ConlluToken): ConlluToken {
  if (!token.misc) return token;

  const updatedMisc = token.misc.filter(
    (misc) => !misc.startsWith(`${LINKEDURIS_MISC_KEY}=`),
  );

  return {
    ...token,
    misc: updatedMisc.length > 0 ? updatedMisc : undefined,
  };
}

/**
 * Get count of linked URIs items for color coding
 */
export function getLinkedURIsCount(token: ConlluToken | null): number {
  const value = getLinkedURIsValue(token);
  return parseLinkedURIsValue(value).length;
}

/**
 * Find tokens similar to the given token (same form + POS)
 */
export function findSimilarTokens(
  referenceToken: ConlluToken,
  document: ConlluDocument,
  referenceSentenceIndex: number,
  referenceTokenIndex: number,
): Array<{ sentenceIndex: number; tokenIndex: number; token: ConlluToken }> {
  const similarTokens: Array<{
    sentenceIndex: number;
    tokenIndex: number;
    token: ConlluToken;
  }> = [];

  document.sentences.forEach((sentence, sentenceIndex) => {
    sentence.tokens.forEach((token, tokenIndex) => {
      // Skip the reference token itself
      if (
        sentenceIndex === referenceSentenceIndex &&
        tokenIndex === referenceTokenIndex
      ) {
        return;
      }

      // Match by form + POS
      if (
        token.form === referenceToken.form &&
        token.upos === referenceToken.upos
      ) {
        similarTokens.push({ sentenceIndex, tokenIndex, token });
      }
    });
  });

  return similarTokens;
}

/**
 * Apply the same links to multiple tokens
 */
export function applyLinksToTokens(
  tokens: Array<{
    sentenceIndex: number;
    tokenIndex: number;
    token: ConlluToken;
  }>,
  links: string[],
): Array<{
  sentenceIndex: number;
  tokenIndex: number;
  updatedToken: ConlluToken;
}> {
  return tokens.map(({ sentenceIndex, tokenIndex, token }) => ({
    sentenceIndex,
    tokenIndex,
    updatedToken: updateTokenLinkedURIs(token, serializeLinkedURIsValue(links)),
  }));
}

// ===== SUGGESTION UTILITIES =====

export interface EntitySuggestion {
  label: string;
  upostag: string;
}

/**
 * Extract suggestion value from token's misc field
 * Returns the serialized JSON string value, or null if not found
 */
export function getSuggestionValue(token: ConlluToken | null): string | null {
  if (!token?.misc) return null;

  const suggestionItem = token.misc.find((misc) =>
    misc.startsWith(`${SUGGESTION_MISC_KEY}=`),
  );
  if (!suggestionItem) return null;

  return suggestionItem.substring(SUGGESTION_MISC_KEY.length + 1); // Remove prefix
}

/**
 * Parse suggestion value into array of EntitySuggestion objects
 * Returns empty array if value is null or empty
 */
export function parseSuggestionValue(value: string | null): EntitySuggestion[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If JSON parsing fails, return empty array
    return [];
  }
}

/**
 * Serialize array of EntitySuggestion objects back to suggestion value format
 */
export function serializeSuggestionValue(
  suggestions: EntitySuggestion[],
): string {
  return JSON.stringify(suggestions);
}

/**
 * Update token's misc field with new suggestion value
 * Creates suggestion entry if it doesn't exist, updates if it does
 */
export function updateTokenSuggestions(
  token: ConlluToken,
  newValue: string,
): ConlluToken {
  const updatedMisc = [...(token.misc || [])];
  const suggestionIndex = updatedMisc.findIndex((misc) =>
    misc.startsWith(`${SUGGESTION_MISC_KEY}=`),
  );

  const suggestionEntry = `${SUGGESTION_MISC_KEY}=${newValue}`;

  if (suggestionIndex >= 0) {
    // Update existing suggestion entry
    updatedMisc[suggestionIndex] = suggestionEntry;
  } else {
    // Add new suggestion entry
    updatedMisc.push(suggestionEntry);
  }

  return {
    ...token,
    misc: updatedMisc.length > 0 ? updatedMisc : undefined,
  };
}

/**
 * Remove suggestion entry from token's misc field
 */
export function removeTokenSuggestions(token: ConlluToken): ConlluToken {
  if (!token.misc) return token;

  const updatedMisc = token.misc.filter(
    (misc) => !misc.startsWith(`${SUGGESTION_MISC_KEY}=`),
  );

  return {
    ...token,
    misc: updatedMisc.length > 0 ? updatedMisc : undefined,
  };
}

/**
 * Extract all suggestions from a parsed ConlluDocument
 * Returns an array of objects with token info and suggestions
 */
export function extractAllSuggestions(parsedData: ConlluDocument): Array<{
  sentenceIndex: number;
  tokenIndex: number;
  tokenId: string;
  tokenForm: string;
  tokenUpos: string;
  suggestions: EntitySuggestion[];
}> {
  const allSuggestions: Array<{
    sentenceIndex: number;
    tokenIndex: number;
    tokenId: string;
    tokenForm: string;
    tokenUpos: string;
    suggestions: EntitySuggestion[];
  }> = [];

  parsedData.sentences.forEach((sentence, sentenceIndex) => {
    sentence.tokens.forEach((token, tokenIndex) => {
      const suggestionValue = getSuggestionValue(token);
      const suggestions = parseSuggestionValue(suggestionValue);

      if (suggestions.length > 0) {
        allSuggestions.push({
          sentenceIndex,
          tokenIndex,
          tokenId: token.id,
          tokenForm: token.form,
          tokenUpos: token.upos,
          suggestions,
        });
      }
    });
  });

  return allSuggestions;
}

/**
 * Generate CSV content from suggestions data
 */
export function generateSuggestionsCSV(suggestionsData: Array<{
  sentenceIndex: number;
  tokenIndex: number;
  tokenId: string;
  tokenForm: string;
  tokenUpos: string;
  suggestions: EntitySuggestion[];
}>): string {
  const headers = [
    'sentence_index',
    'token_index',
    'token_form',
    'token_upos',
    'suggestion_label',
    'suggestion_upos'
  ];

  const rows: string[] = [headers.join(',')];

  suggestionsData.forEach(({ sentenceIndex, tokenIndex, tokenForm, tokenUpos, suggestions }) => {
    suggestions.forEach((suggestion) => {
      const row = [
        sentenceIndex.toString(),
        tokenIndex.toString(),
        `"${tokenForm}"`,
        `"${tokenUpos}"`,
        `"${suggestion.label}"`,
        `"${suggestion.upostag}"`
      ];
      rows.push(row.join(','));
    });
  });

  return rows.join('\n');
}

/**
 * Download CSV file with suggestions data
 */
export function downloadSuggestionsCSV(parsedData: ConlluDocument, filename: string = 'suggestions.csv'): void {
  const suggestionsData = extractAllSuggestions(parsedData);

  if (suggestionsData.length === 0) {
    alert('No suggestions found to download.');
    return;
  }

  const csvContent = generateSuggestionsCSV(suggestionsData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Get count of suggestion items for color coding
 */
export function getSuggestionCount(token: ConlluToken | null): number {
  const value = getSuggestionValue(token);
  return parseSuggestionValue(value).length;
}
