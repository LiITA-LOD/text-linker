import type { ConlluToken } from './conllu';

/**
 * Extract LiITA value from token's misc field
 * Returns the comma-separated string value, or null if not found
 */
export function getLiITAValue(token: ConlluToken | null): string | null {
  if (!token?.misc) return null;
  
  const liitaItem = token.misc.find((misc) => misc.startsWith('LiITA='));
  if (!liitaItem) return null;
  
  return liitaItem.substring(6); // Remove 'LiITA=' prefix
}

/**
 * Parse LiITA value into array of strings
 * Returns empty array if value is null or empty
 */
export function parseLiITAValue(value: string | null): string[] {
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
 * Serialize array of strings back to LiITA value format
 */
export function serializeLiITAValue(items: string[]): string {
  return JSON.stringify(items);
}

/**
 * Update token's misc field with new LiITA value
 * Creates LiITA entry if it doesn't exist, updates if it does
 */
export function updateTokenLiITA(token: ConlluToken, newValue: string): ConlluToken {
  const updatedMisc = [...(token.misc || [])];
  const liitaIndex = updatedMisc.findIndex((misc) => misc.startsWith('LiITA='));
  
  const liitaEntry = `LiITA=${newValue}`;
  
  if (liitaIndex >= 0) {
    // Update existing LiITA entry
    updatedMisc[liitaIndex] = liitaEntry;
  } else {
    // Add new LiITA entry
    updatedMisc.push(liitaEntry);
  }
  
  return {
    ...token,
    misc: updatedMisc.length > 0 ? updatedMisc : undefined,
  };
}

/**
 * Remove LiITA entry from token's misc field
 */
export function removeTokenLiITA(token: ConlluToken): ConlluToken {
  if (!token.misc) return token;
  
  const updatedMisc = token.misc.filter((misc) => !misc.startsWith('LiITA='));
  
  return {
    ...token,
    misc: updatedMisc.length > 0 ? updatedMisc : undefined,
  };
}

/**
 * Get count of LiITA items for color coding
 */
export function getLiITACount(token: ConlluToken | null): number {
  const value = getLiITAValue(token);
  return parseLiITAValue(value).length;
}
