import type { ConlluToken } from './conllu';

const LINKEDURIS_MISC_KEY = 'LiITA'; // TODO: rename to LiITALinkedURIs here and in backend

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
