import { describe, expect, test } from '@rstest/core';
import { parse, serialize, validate } from './conllu';

describe('parse', () => {
  test('parses empty input as zero sentences', () => {
    expect(parse('').sentences).toHaveLength(0);
  });

  test('parses whitespace-only input as zero sentences', () => {
    expect(parse('   \n  \t  \n  ').sentences).toHaveLength(0);
  });

  test('parses one sentence', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    expect(parse(input).sentences).toHaveLength(1);
  });

  test('parses two metadata comments', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    expect(parse(input).sentences[0].comments).toHaveLength(2);
  });

  test('parses two tokens', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    expect(parse(input).sentences[0].tokens).toHaveLength(2);
  });

  test('parses two sentences', () => {
    const input = `# sent_id = 1\n1\tHello\thello\tINTJ\tUH\t_\t0\troot\t_\t_\n\n# sent_id = 2\n1\tGoodbye\tgoodbye\tINTJ\tUH\t_\t0\troot\t_\t_`;
    expect(parse(input).sentences).toHaveLength(2);
  });

  test('parses free-form comment', () => {
    const input = `# This is a comment\n1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(parse(input).sentences[0].comments[0]).toEqual({
      type: 'freeform',
      text: 'This is a comment',
    });
  });

  test('parses metadata comment', () => {
    const input = `# sent_id = 1\n1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(parse(input).sentences[0].comments[0]).toEqual({
      type: 'metadata',
      key: 'sent_id',
      value: '1',
    });
  });

  test('parses multiword token id', () => {
    const input = `1-2\tNew York\t_\t_\t_\t_\t_\t_\t_\t_\n1\tNew\tnew\tPROPN\tNNP\t_\t2\tcompound\t_\t_\n2\tYork\tyork\tPROPN\tNNP\t_\t0\troot\t_\t_`;
    expect(parse(input).sentences[0].tokens[0].id).toBe('1-2');
  });

  test('parses multiword token form', () => {
    const input = `1-2\tNew York\t_\t_\t_\t_\t_\t_\t_\t_\n1\tNew\tnew\tPROPN\tNNP\t_\t2\tcompound\t_\t_\n2\tYork\tyork\tPROPN\tNNP\t_\t0\troot\t_\t_`;
    expect(parse(input).sentences[0].tokens[0].form).toBe('New York');
  });

  test('parses underscore feats', () => {
    const input = `1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(parse(input).sentences[0].tokens[0].feats).toBeUndefined();
  });

  test('parses multiword tokens', () => {
    const input = `# sent_id = 1
# text = vámonos al mar
1-2	vámonos	_	_	_	_	_	_	_	_
1	vamos	ir	VERB	VBP	Number=Plur|Person=1	0	root	_	_
2	nos	nosotros	PRON	PRP	Number=Plur|Person=1	1	obj	_	_
3-4	al	_	_	_	_	_	_	_	_
3	a	a	ADP	IN	_	1	obl	_	_
4	el	el	DET	DT	Definite=Def|Gender=Masc|Number=Sing	3	case	_	_
5	mar	mar	NOUN	NN	Gender=Masc|Number=Sing	3	obj	_	_`;

    const result = parse(input);
    expect(result.sentences[0].tokens).toHaveLength(7);
    expect(result.sentences[0].tokens[0].id).toBe('1-2');
    expect(result.sentences[0].tokens[0].form).toBe('vámonos');
  });

  test('parses empty nodes', () => {
    const input = `# sent_id = 1
# text = Sue likes coffee and Bill tea
1	Sue	Sue	PROPN	NNP	Number=Sing	2	nsubj	_	_
2	likes	like	VERB	VBZ	Number=Sing|Person=3|Tense=Pres	0	root	_	_
3	coffee	coffee	NOUN	NN	Number=Sing	2	obj	_	_
4	and	and	CCONJ	CC	_	2	cc	_	_
5	Bill	Bill	PROPN	NNP	Number=Sing	6	nsubj	_	_
5.1	likes	like	VERB	VBZ	Number=Sing|Person=3|Tense=Pres	_	_	2:conj	_
6	tea	tea	NOUN	NN	Number=Sing	5.1	obj	_	_`;

    const result = parse(input);
    expect(result.sentences[0].tokens).toHaveLength(7);
    expect(result.sentences[0].tokens.some((t) => t.id === '5.1')).toBe(true);
  });

  test('parses sentence-initial empty nodes', () => {
    const input = `# sent_id = 1
# text = (He) likes coffee
0.1	He	he	PRON	PRP	Case=Nom|Number=Sing|Person=3	2	nsubj	_	_
1	likes	like	VERB	VBZ	Number=Sing|Person=3|Tense=Pres	0	root	_	_
2	coffee	coffee	NOUN	NN	Number=Sing	1	obj	_	_`;

    const result = parse(input);
    expect(result.sentences[0].tokens).toHaveLength(3);
    expect(result.sentences[0].tokens[0].id).toBe('0.1');
  });
});

describe('serialize', () => {
  test('serializes empty document as empty string', () => {
    expect(serialize({ sentences: [] })).toBe('');
  });

  test('serializes sentence with metadata comment', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('# sent_id = 1');
  });

  test('serializes sentence with token line', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain(
      '1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_',
    );
  });

  test('serializes sentence without comments', () => {
    const document = {
      sentences: [
        {
          comments: [],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toBe(
      '1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_',
    );
  });

  test('serializes two sentences with both sent_id comments', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'Hello',
              lemma: 'hello',
              upos: 'INTJ',
              xpos: 'UH',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '2' }],
          tokens: [
            {
              id: '1',
              form: 'Goodbye',
              lemma: 'goodbye',
              upos: 'INTJ',
              xpos: 'UH',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('# sent_id = 1');
    expect(serialize(document)).toContain('# sent_id = 2');
  });

  test('serializes two sentences with both token lines', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'Hello',
              lemma: 'hello',
              upos: 'INTJ',
              xpos: 'UH',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '2' }],
          tokens: [
            {
              id: '1',
              form: 'Goodbye',
              lemma: 'goodbye',
              upos: 'INTJ',
              xpos: 'UH',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('Hello');
    expect(serialize(document)).toContain('Goodbye');
  });

  test('serializes multiword tokens', () => {
    const document = {
      sentences: [
        {
          comments: [
            { type: 'metadata' as const, key: 'sent_id', value: '1' },
            { type: 'metadata' as const, key: 'text', value: 'vámonos al mar' },
          ],
          tokens: [
            {
              id: '1-2',
              form: 'vámonos',
              lemma: undefined,
              upos: undefined,
              xpos: undefined,
              feats: undefined,
              head: undefined,
              deprel: undefined,
              deps: undefined,
              misc: undefined,
            },
            {
              id: '1',
              form: 'vamos',
              lemma: 'ir',
              upos: 'VERB',
              xpos: 'VBP',
              feats: { Number: 'Plur', Person: '1' },
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };

    const result = serialize(document);
    expect(result).toContain('1-2	vámonos	_	_	_	_	_	_	_	_');
  });
});

describe('validate', () => {
  test('validates correct format as valid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No\n3\t.\t.\tPUNCT\t.\t_\t2\tpunct\t_\t_`;
    expect(validate(input).isValid).toBe(true);
  });

  test('validates correct format as no errors', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No\n3\t.\t.\tPUNCT\t.\t_\t2\tpunct\t_\t_`;
    expect(validate(input).errors).toHaveLength(0);
  });

  test('validates empty input as valid', () => {
    expect(validate('').isValid).toBe(true);
  });

  test('rejects missing required metadata', () => {
    const input = `1	Hello	hello	INTJ	UH	_	2	discourse	_	_
2	world	world	NOUN	NN	Number=Sing	0	root	_	SpaceAfter=No
3	.	.	PUNCT	.	_	2	punct	_	_`;
    const result = validate(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Sentence 1: Missing required sent_id comment',
        'Sentence 1: Missing required text comment',
      ]),
    );
  });

  test('rejects missing fields as invalid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\t0\troot\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects missing fields with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\t0\troot\t_`;
    expect(validate(input).errors[0]).toMatch(
      /must have 10 tab-separated fields/,
    );
  });

  test('rejects invalid token ID as invalid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\nabc\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects invalid token ID with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\nabc\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/Invalid token ID format/);
  });

  test('rejects invalid metadata format as invalid', () => {
    const input = `# sent_id = \n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects invalid metadata format with error message', () => {
    const input = `# sent_id = \n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/Invalid metadata format/);
  });

  test('accepts underscore as valid ID', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n_\tword\tword\tNOUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).isValid).toBe(true);
  });

  test('accepts valid multiword tokens as valid', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-2\tvámonos\t_\t_\t_\t_\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVB\t_\t2\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    expect(validate(input).isValid).toBe(true);
  });

  test('accepts multiword tokens with Typo=Yes as valid', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-2\tvámonos\t_\t_\t_\tTypo=Yes\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVB\t_\t2\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    expect(validate(input).isValid).toBe(true);
  });

  test('rejects multiword tokens with invalid fields as invalid', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-2\tvámonos\tlemma\t_\t_\t_\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVB\t_\t2\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects multiword tokens with invalid fields with error message', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-2\tvámonos\tlemma\t_\t_\t_\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVB\t_\t2\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/Multiword token fields/);
  });

  test('rejects multiword tokens with invalid FEATS as invalid', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-2\tvámonos\t_\t_\t_\tGender=Fem\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVB\t_\t2\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects multiword tokens with invalid FEATS with error message', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-2\tvámonos\t_\t_\t_\tGender=Fem\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVB\t_\t2\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/Multiword token FEATS/);
  });

  test('accepts valid empty nodes as valid', () => {
    const input = `# sent_id = 1\n# text = Sue likes coffee and Bill tea\n1\tSue\tSue\tPROPN\tNNP\t_\t2\tnsubj\t_\t_\n2\tlikes\tlike\tVERB\tVBZ\t_\t0\troot\t_\t_\n3\tcoffee\tcoffee\tNOUN\tNN\t_\t2\tobj\t_\t_\n4\tand\tand\tCCONJ\tCC\t_\t5\tcc\t_\t_\n5\tBill\tBill\tPROPN\tNNP\t_\t2\tconj\t_\t_\n5.1\tlikes\tlike\tVERB\tVBZ\t_\t_\t_\t2:conj\t_\n6\ttea\ttea\tNOUN\tNN\t_\t5\tobj\t_\t_`;
    expect(validate(input).isValid).toBe(true);
  });

  test('rejects empty nodes with non-underscore HEAD as invalid', () => {
    const input = `# sent_id = 1\n# text = Sue likes coffee and Bill tea\n1.1\tword\tword\tNOUN\tNN\t_\t0\troot\t2:conj\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects empty nodes with non-underscore HEAD with error message', () => {
    const input = `# sent_id = 1\n# text = Sue likes coffee and Bill tea\n1.1\tword\tword\tNOUN\tNN\t_\t0\troot\t2:conj\t_`;
    expect(validate(input).errors[0]).toMatch(/Empty node fields/);
  });

  test('rejects empty nodes with missing DEPS as invalid', () => {
    const input = `# sent_id = 1\n# text = Sue likes coffee and Bill tea\n1.1\tword\tword\tNOUN\tNN\t_\t_\t_\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects empty nodes with missing DEPS with error message', () => {
    const input = `# sent_id = 1\n# text = Sue likes coffee and Bill tea\n1.1\tword\tword\tNOUN\tNN\t_\t_\t_\t_\t_`;
    expect(validate(input).errors[0]).toMatch(
      /Empty node field DEPS is required/,
    );
  });

  test('rejects spaces in restricted fields as invalid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tN OUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects spaces in restricted fields with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tN OUN\tNN\t_\t0\troot\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/No spaces allowed in field/);
  });

  test('accepts spaces in allowed fields as valid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword with space\tlemma with space\tNOUN\tNN\t_\t0\troot\t_\tSome misc value`;
    expect(validate(input).isValid).toBe(true);
  });

  test('rejects invalid HEAD for regular tokens as invalid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\tfoo\troot\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects invalid HEAD for regular tokens with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\tfoo\troot\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/HEAD must be integer or 0/);
  });

  test('rejects empty DEPREL for regular tokens as invalid', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\t0\t\t_\t_`;
    expect(validate(input).isValid).toBe(false);
  });

  test('rejects empty DEPREL for regular tokens with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tword\tword\tNOUN\tNN\t_\t0\t\t_\t_`;
    expect(validate(input).errors[0]).toMatch(/DEPREL must not be empty/);
  });

  test('rejects invalid empty node sequence', () => {
    const input = `# sent_id = 1\n# text = Sue likes coffee and Bill tea\n1\tSue\tSue\tPROPN\tNNP\t_\t2\tnsubj\t_\t_\n2\tlikes\tlike\tVERB\tVBZ\t_\t0\troot\t_\t_\n3\tcoffee\tcoffee\tNOUN\tNN\t_\t2\tobj\t_\t_\n4\tand\tand\tCCONJ\tCC\t_\t5\tcc\t_\t_\n5\tBill\tBill\tPROPN\tNNP\t_\t2\tconj\t_\t_\n5.2\tlikes\tlike\tVERB\tVBZ\t_\t_\t_\t2:conj\t_\n6\ttea\ttea\tNOUN\tNN\t_\t5\tobj\t_\t_`;
    const result = validate(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Line 6: Empty node sequence must start at 1 and be consecutive (expected 5.1, got 5.2)',
      ]),
    );
  });

  test('rejects nonempty multiword token range', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-1\tvámonos\t_\t_\t_\t_\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVBP\t_\t0\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_`;
    const result = validate(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Line 3: Multiword token range must be nonempty (start < end)',
    );
  });

  test('rejects overlapping multiword token ranges', () => {
    const input = `# sent_id = 1\n# text = vámonos al mar\n1-3\tvámonos\t_\t_\t_\t_\t_\t_\t_\t_\n1\tvamos\tir\tVERB\tVBP\t_\t0\troot\t_\t_\n2\tnos\tnosotros\tPRON\tPRP\t_\t1\tobj\t_\t_\n2-4\tal\t_\t_\t_\t_\t_\t_\t_\t_\n3\ta\ta\tADP\tIN\t_\t1\tobl\t_\t_\n4\tel\tel\tDET\tDT\t_\t3\tcase\t_\t_`;
    const result = validate(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Line 6: Multiword token ranges must not overlap',
      ]),
    );
  });

  test('validates complex example with all features', () => {
    const input = `# sent_id = panc0.s4
# text = तत् यथानुश्रूयते।
# translit = tat yathānuśrūyate.
# text_en = This is what is heard.
1	तत्	तद्	DET	_	Case=Nom|Gender=Neut|Number=Sing|PronType=Dem	3	nsubj	_	Translit=tat|LTranslit=tad|Gloss=it
2-3	यथानुश्रूयते	_	_	_	_	_	_	_	SpaceAfter=No
2	यथा	यथा	ADV	_	PronType=Rel	3	advmod	_	Translit=yathā|LTranslit=yathā|Gloss=how
3	अनुश्रूयते	अनु-श्रु	VERB	_	Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Pass	0	root	_	Translit=anuśrūyate|LTranslit=anu-śru|Gloss=it-is-heard
4	।	।	PUNCT	_	_	3	punct	_	Translit=.|LTranslit=.|Gloss=.`;

    const result = validate(input);
    expect(result.isValid).toBe(true);
  });
});

describe('FEATS parsing', () => {
  test('parses underscore feats as undefined', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[0].feats).toBeUndefined();
  });

  test('parses single feature as key-value pair', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].feats).toEqual({ Number: 'Sing' });
  });

  test('parses multiple features as key-value pairs', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing|Person=3\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].feats).toEqual({
      Number: 'Sing',
      Person: '3',
    });
  });

  test('parses complex feature combinations', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tGender=Masc|Number=Sing|Case=Nom\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].feats).toEqual({
      Gender: 'Masc',
      Number: 'Sing',
      Case: 'Nom',
    });
  });

  test('handles empty feature values', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tGender=|Number=Sing\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].feats).toEqual({
      Gender: '',
      Number: 'Sing',
    });
  });

  test('handles feature values with equals signs', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tFeature=Value=With=Equals\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].feats).toEqual({
      Feature: 'Value=With=Equals',
    });
  });

  test('serializes empty feats object as underscore', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('\t_\t');
  });

  test('serializes single feature as key-value pair', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: { Number: 'Sing' },
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('\tNumber=Sing\t');
  });

  test('serializes multiple features in alphabetical order', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: { Number: 'Sing', Gender: 'Masc', Case: 'Nom' },
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: undefined,
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain(
      '\tCase=Nom|Gender=Masc|Number=Sing\t',
    );
  });

  test('validates malformed feats with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing|InvalidFeature\t0\troot\t_\tSpaceAfter=No`;
    const result = validate(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Line 4: Invalid FEATS format: "InvalidFeature" (missing equals sign)',
      ]),
    );
  });

  test('validates empty feature key with error message', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\t=Sing|Number=Sing\t0\troot\t_\tSpaceAfter=No`;
    const result = validate(input);
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Line 4: Invalid FEATS format: "=Sing" (empty feature key)',
      ]),
    );
  });
});

describe('MISC parsing', () => {
  test('parses underscore MISC as undefined', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[0].misc).toBeUndefined();
  });

  test('parses single MISC component', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].misc).toEqual(['SpaceAfter=No']);
  });

  test('parses multiple MISC components', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No|Translit=world|Gloss=earth`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].misc).toEqual([
      'SpaceAfter=No',
      'Translit=world',
      'Gloss=earth',
    ]);
  });

  test('handles empty MISC components', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tSpaceAfter=No||Translit=hello`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].misc).toEqual([
      'SpaceAfter=No',
      '',
      'Translit=hello',
    ]);
  });

  test('handles MISC components with equals signs', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tXML=<tag attr="value">|SpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].misc).toEqual([
      'XML=<tag attr="value">',
      'SpaceAfter=No',
    ]);
  });

  test('handles MISC components with pipes in content', () => {
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\tXML=<tag>content|with|pipes</tag>|SpaceAfter=No`;
    const result = parse(input);
    expect(result.sentences[0].tokens[1].misc).toEqual([
      'XML=<tag>content',
      'with',
      'pipes</tag>',
      'SpaceAfter=No',
    ]);
  });

  test('serializes empty MISC array as underscore', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: [],
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('\t_\t');
  });

  test('serializes single MISC component', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: ['SpaceAfter=No'],
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('\tSpaceAfter=No');
  });

  test('serializes multiple MISC components', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: ['SpaceAfter=No', 'Translit=hello', 'Gloss=greeting'],
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain(
      '\tSpaceAfter=No|Translit=hello|Gloss=greeting',
    );
  });

  test('serializes MISC components with empty strings', () => {
    const document = {
      sentences: [
        {
          comments: [{ type: 'metadata' as const, key: 'sent_id', value: '1' }],
          tokens: [
            {
              id: '1',
              form: 'word',
              lemma: 'word',
              upos: 'NOUN',
              xpos: 'NN',
              feats: undefined,
              head: '0',
              deprel: 'root',
              deps: undefined,
              misc: ['SpaceAfter=No', '', 'Translit=hello'],
            },
          ],
        },
      ],
    };
    expect(serialize(document)).toContain('\tSpaceAfter=No||Translit=hello');
  });

  test('handles invalid MISC field gracefully in parse', () => {
    // Test with a MISC field that has leading space (invalid according to UD spec)
    const input = `# sent_id = 1\n# text = Hello world.\n1\tHello\thello\tINTJ\tUH\t_\t2\tdiscourse\t_\t_\n2\tworld\tworld\tNOUN\tNN\tNumber=Sing\t0\troot\t_\t SpaceAfter=No`;
    const parsed = parse(input);
    // Invalid MISC field should be set to undefined due to try-catch in createToken
    expect(parsed.sentences[0].tokens[1].misc).toBeUndefined();
  });
});
