export interface ConlluToken {
  id: string;
  form: string;
  lemma: string;
  upos: string;
  xpos: string;
  feats: string;
  head: string;
  deprel: string;
  deps: string;
  misc: string;
}

export type ConlluComment =
  | { type: 'metadata'; key: string; value: string }
  | { type: 'freeform'; text: string };

export interface ConlluSentence {
  comments: ConlluComment[];
  tokens: ConlluToken[];
}

export interface ConlluDocument {
  sentences: ConlluSentence[];
}

// Constants for field indices and validation
const FIELD_INDICES = {
  ID: 0,
  FORM: 1,
  LEMMA: 2,
  UPOS: 3,
  XPOS: 4,
  FEATS: 5,
  HEAD: 6,
  DEPREL: 7,
  DEPS: 8,
  MISC: 9,
} as const;

const FIELD_NAMES = [
  'ID',
  'FORM',
  'LEMMA',
  'UPOS',
  'XPOS',
  'FEATS',
  'HEAD',
  'DEPREL',
  'DEPS',
  'MISC',
] as const;
const SPACE_ALLOWED_INDICES = [
  FIELD_INDICES.FORM,
  FIELD_INDICES.LEMMA,
  FIELD_INDICES.MISC,
] as const;

// Type guards
const isMultiwordToken = (id: string): boolean => /^\d+-\d+$/.test(id);
const isEmptyNode = (id: string): boolean =>
  /^(0|[1-9]\d*)\.[1-9]\d*$/.test(id); // decimal, not ending in .0
const isRegularToken = (id: string): boolean => /^\d+$/.test(id);
const isValidTokenId = (id: string): boolean =>
  isMultiwordToken(id) || isEmptyNode(id) || isRegularToken(id) || id === '_';

/**
 * Parse CoNLL-U format string into structured data
 */
export function parse(text: string): ConlluDocument {
  const lines = text.trim().split('\n');
  const sentences: ConlluSentence[] = [];
  let currentSentence: ConlluSentence | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      if (currentSentence) {
        sentences.push(currentSentence);
        currentSentence = null;
      }
      continue;
    }

    if (trimmedLine.startsWith('#')) {
      currentSentence ??= { comments: [], tokens: [] };
      parseComment(trimmedLine, currentSentence);
      continue;
    }

    const fields = trimmedLine.split('\t');
    if (fields.length >= 10) {
      currentSentence ??= { comments: [], tokens: [] };
      currentSentence.tokens.push(createToken(fields));
    }
  }

  if (currentSentence) {
    sentences.push(currentSentence);
  }

  return { sentences };
}

/**
 * Serialize structured data back to CoNLL-U format
 */
export function serialize(document: ConlluDocument): string {
  return document.sentences
    .map((sentence) => serializeSentence(sentence))
    .join('\n\n')
    .replace(/\n\n$/, '');
}

/**
 * Validate CoNLL-U format
 */
export function validate(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = text.trim().split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lineNumber = i + 1;
    if (line.startsWith('#')) {
      validateComment(line, lineNumber, errors);
    } else {
      validateTokenLine(line, lineNumber, errors);
    }
  }

  // Validate sentence-level constraints
  validateSentenceConstraints(lines, errors);

  return { isValid: errors.length === 0, errors };
}

function parseComment(line: string, sentence: ConlluSentence): void {
  const commentContent = line.substring(1).trim();
  const equalIndex = commentContent.indexOf('=');

  if (equalIndex !== -1) {
    const key = commentContent.substring(0, equalIndex).trim();
    const value = commentContent.substring(equalIndex + 1).trim();
    sentence.comments.push({ type: 'metadata', key, value });
  } else {
    sentence.comments.push({ type: 'freeform', text: commentContent });
  }
}

function createToken(fields: string[]): ConlluToken {
  return {
    id: fields[FIELD_INDICES.ID] || '_',
    form: fields[FIELD_INDICES.FORM] || '_',
    lemma: fields[FIELD_INDICES.LEMMA] || '_',
    upos: fields[FIELD_INDICES.UPOS] || '_',
    xpos: fields[FIELD_INDICES.XPOS] || '_',
    feats: fields[FIELD_INDICES.FEATS] || '_',
    head: fields[FIELD_INDICES.HEAD] || '_',
    deprel: fields[FIELD_INDICES.DEPREL] || '_',
    deps: fields[FIELD_INDICES.DEPS] || '_',
    misc: fields[FIELD_INDICES.MISC] || '_',
  };
}

function serializeSentence(sentence: ConlluSentence): string {
  const lines: string[] = [];

  // Add comments
  for (const comment of sentence.comments) {
    lines.push(
      comment.type === 'metadata'
        ? `# ${comment.key} = ${comment.value}`
        : `# ${comment.text}`,
    );
  }

  // Add tokens
  for (const token of sentence.tokens) {
    lines.push(
      [
        token.id,
        token.form,
        token.lemma,
        token.upos,
        token.xpos,
        token.feats,
        token.head,
        token.deprel,
        token.deps,
        token.misc,
      ].join('\t'),
    );
  }

  return lines.join('\n');
}

function validateComment(
  line: string,
  lineNumber: number,
  errors: string[],
): void {
  const commentContent = line.substring(1).trim();
  if (commentContent.includes('=')) {
    const parts = commentContent.split('=');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      errors.push(`Line ${lineNumber}: Invalid metadata format`);
    }
  }
}

function validateTokenLine(
  line: string,
  lineNumber: number,
  errors: string[],
): void {
  const fields = line.split('\t');

  if (fields.length < 10) {
    errors.push(
      `Line ${lineNumber}: Token line must have 10 tab-separated fields`,
    );
    return;
  }

  const id = fields[FIELD_INDICES.ID];
  if (!isValidTokenId(id)) {
    errors.push(`Line ${lineNumber}: Invalid token ID format`);
    return;
  }

  // Validate based on token type
  if (isMultiwordToken(id)) {
    validateMultiwordToken(fields, lineNumber, errors);
  } else if (isEmptyNode(id)) {
    validateEmptyNode(fields, lineNumber, errors);
  } else {
    validateRegularToken(fields, lineNumber, errors);
  }

  validateFieldSpaces(fields, lineNumber, errors);
}

function validateMultiwordToken(
  fields: string[],
  lineNumber: number,
  errors: string[],
): void {
  const restrictedFields = [
    fields[FIELD_INDICES.LEMMA],
    fields[FIELD_INDICES.UPOS],
    fields[FIELD_INDICES.XPOS],
    fields[FIELD_INDICES.HEAD],
    fields[FIELD_INDICES.DEPREL],
    fields[FIELD_INDICES.DEPS],
  ];

  if (restrictedFields.some((field) => field !== '_')) {
    errors.push(
      `Line ${lineNumber}: Multiword token fields (except FORM, MISC, FEATS=Typo=Yes) must be underscores`,
    );
  }

  const feats = fields[FIELD_INDICES.FEATS];
  if (feats !== '_' && feats !== 'Typo=Yes') {
    errors.push(
      `Line ${lineNumber}: Multiword token FEATS must be '_' or 'Typo=Yes'`,
    );
  }
}

function validateEmptyNode(
  fields: string[],
  lineNumber: number,
  errors: string[],
): void {
  if (
    fields[FIELD_INDICES.HEAD] !== '_' ||
    fields[FIELD_INDICES.DEPREL] !== '_'
  ) {
    errors.push(
      `Line ${lineNumber}: Empty node fields HEAD and DEPREL must be underscores`,
    );
  }

  if (fields[FIELD_INDICES.DEPS] === '_') {
    errors.push(`Line ${lineNumber}: Empty node field DEPS is required`);
  }
}

function validateRegularToken(
  fields: string[],
  lineNumber: number,
  errors: string[],
): void {
  if (!/^\d+$/.test(fields[FIELD_INDICES.HEAD])) {
    errors.push(`Line ${lineNumber}: HEAD must be integer or 0`);
  }

  if (!fields[FIELD_INDICES.DEPREL] || fields[FIELD_INDICES.DEPREL] === '_') {
    errors.push(`Line ${lineNumber}: DEPREL must not be empty`);
  }
}

function validateFieldSpaces(
  fields: string[],
  lineNumber: number,
  errors: string[],
): void {
  for (let i = 0; i < fields.length && i < 10; i++) {
    if (
      !SPACE_ALLOWED_INDICES.includes(
        i as (typeof SPACE_ALLOWED_INDICES)[number],
      ) &&
      /\s/.test(fields[i])
    ) {
      errors.push(
        `Line ${lineNumber}: No spaces allowed in field ${FIELD_NAMES[i]}`,
      );
    }
  }
}

function validateSentenceConstraints(lines: string[], errors: string[]): void {
  let currentSentence = 1;
  let hasSentId = false;
  let hasText = false;
  let hasTokens = false;
  const multiwordRanges: string[] = [];
  const emptyNodeSequences = new Map<string, number>();
  let tokenLineNumber = 0;

  function checkSentenceMeta() {
    if (hasTokens) {
      if (!hasSentId) {
        errors.push(
          `Sentence ${currentSentence}: Missing required sent_id comment`,
        );
      }
      if (!hasText) {
        errors.push(
          `Sentence ${currentSentence}: Missing required text comment`,
        );
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      checkSentenceMeta();
      currentSentence++;
      hasSentId = false;
      hasText = false;
      hasTokens = false;
      multiwordRanges.length = 0;
      emptyNodeSequences.clear();
      tokenLineNumber = 0;
      continue;
    }
    if (line.startsWith('#')) {
      const commentContent = line.substring(1).trim();
      const equalIndex = commentContent.indexOf('=');
      if (equalIndex !== -1) {
        const key = commentContent.substring(0, equalIndex).trim();
        if (key === 'sent_id') hasSentId = true;
        if (key === 'text') hasText = true;
      }
      continue;
    }
    // Token line
    tokenLineNumber++;
    const fields = line.split('\t');
    if (fields.length >= 10) {
      hasTokens = true;
      const id = fields[FIELD_INDICES.ID];
      // Validate multiword token ranges
      if (isMultiwordToken(id)) {
        const [start, end] = id.split('-').map(Number);
        if (start >= end) {
          errors.push(
            `Line ${i + 1}: Multiword token range must be nonempty (start < end)`,
          );
        }
        for (const range of multiwordRanges) {
          const [rangeStart, rangeEnd] = range.split('-').map(Number);
          if (start <= rangeEnd && end >= rangeStart) {
            errors.push(
              `Line ${i + 1}: Multiword token ranges must not overlap`,
            );
          }
        }
        multiwordRanges.push(id);
      }
      // Validate empty node sequences
      if (isEmptyNode(id)) {
        const match = id.match(/^(\d+)\.(\d+)$/);
        if (match) {
          const baseId = match[1];
          const sequenceNum = parseInt(match[2]);
          const expectedSequence = (emptyNodeSequences.get(baseId) || 0) + 1;
          if (sequenceNum !== expectedSequence) {
            errors.push(
              `Line ${tokenLineNumber}: Empty node sequence must start at 1 and be consecutive (expected ${baseId}.${expectedSequence}, got ${id})`,
            );
          }
          emptyNodeSequences.set(baseId, sequenceNum);
        }
      }
    }
  }
  checkSentenceMeta();
}
