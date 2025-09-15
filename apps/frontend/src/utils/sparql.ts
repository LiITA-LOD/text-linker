interface SparqlResponse {
  head: any;
  results: {
    distinct: boolean;
    ordered: boolean;
    bindings: SparqlBinding[];
  };
}

interface SparqlBinding {
  [key: string]: {
    type: 'uri' | 'literal';
    value: string;
  };
}

async function client(query: string, endpointUrl = 'https://liita.it/sparql'): Promise<SparqlResponse> {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    },
    body: new URLSearchParams({ query: query })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: SparqlResponse = await response.json()

  return data
}

export interface SearchResult {
  uri: string;
  upos: string;
  label: string;
  writtenRepresentations: string[];
}

function uriToUPOS(uri: string): string {
  return POS_URI_TO_UPOS[uri] || uri.split('/').pop() || ''
}

const POS_URI_TO_UPOS: Record<string, string> = {
  'http://lila-erc.eu/ontologies/lila/adjective': 'ADJ',
  'http://lila-erc.eu/ontologies/lila/adposition': 'ADP',
  'http://lila-erc.eu/ontologies/lila/adverb': 'ADV',
  'http://lila-erc.eu/ontologies/lila/coordinating_conjunction': 'CCONJ',
  'http://lila-erc.eu/ontologies/lila/determiner': 'DET',
  'http://lila-erc.eu/ontologies/lila/interjection': 'INTJ',
  'http://lila-erc.eu/ontologies/lila/noun': 'NOUN',
  'http://lila-erc.eu/ontologies/lila/numeral': 'NUM',
  'http://lila-erc.eu/ontologies/lila/other': 'X',
  'http://lila-erc.eu/ontologies/lila/particle': 'PART',
  'http://lila-erc.eu/ontologies/lila/pronoun': 'PRON',
  'http://lila-erc.eu/ontologies/lila/proper_noun': 'PROPN',
  'http://lila-erc.eu/ontologies/lila/subordinating_conjunction': 'SCONJ',
  'http://lila-erc.eu/ontologies/lila/verb': 'VERB',
}

export async function search(regex: string): Promise<SearchResult[]> {
  const query = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX lila: <http://lila-erc.eu/ontologies/lila/>

SELECT ?uri ?uposUri ?label (GROUP_CONCAT(DISTINCT ?wr; SEPARATOR="\\u0000") AS ?wrs)
FROM <http://liita.it/data>
WHERE {
  ?uri lila:hasPOS ?uposUri ;
         ontolex:writtenRep ?wr ;
         rdfs:label ?label .
  FILTER regex(?wr, "${regex}","i")
}
GROUP BY ?uri ?uposUri ?label
ORDER BY ?wrs
LIMIT 100
`

  try {
    const data = await client(query)

    // Parse SPARQL JSON results and return simplified structure
    const results: SearchResult[] = data.results.bindings.map(binding => ({
      uri: binding.uri.value,
      upos: uriToUPOS(binding.uposUri.value),
      label: binding.label.value,
      writtenRepresentations: binding.wrs.value.split('\u0000')
    }))

    return results
  } catch (error) {
    console.error('SPARQL query failed:', error)
    return []
  }
}

export async function getAllPredicates(uri: string): Promise<SparqlBinding[]> {
  const query = `SELECT * WHERE { <${uri}> ?predicate ?object }`

  try {
    const data = await client(query)
    return data.results.bindings
  } catch (error) {
    console.error('SPARQL fetch failed:', error)
    return []
  }
}

