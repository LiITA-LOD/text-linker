const ENDPOINT_URL = 'https://liita.it/sparql'

interface SparqlResponse {
  head: any;
  results: {
    distinct: boolean;
    ordered: boolean;
    bindings: {
      [key: string]: {
        type: 'uri' | 'literal';
        value: string;
      };
    }[];
  };
}

interface SearchResult {
  uri: string;
  upos: string;
  label: string;
  writtenRepresentations: string[];
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
    const response = await fetch(ENDPOINT_URL, {
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

    // Parse SPARQL JSON results and return simplified structure
    const results: SearchResult[] = data.results.bindings.map(binding => ({
      uri: binding.uri.value,
      upos: binding.uposUri.value.split('/').pop() || '', // FIXME: get the label instead of the uri in the query
      label: binding.label.value,
      writtenRepresentations: binding.wrs.value.split('\u0000')
    }))

    return results
  } catch (error) {
    console.error('SPARQL query failed:', error)
    return []
  }
}

