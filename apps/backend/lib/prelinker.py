import json
import os
from collections import defaultdict

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from stanza.utils.conll import CoNLL
from stanza.models.common.doc import Document


class PrelinkerService:

    def __init__(self):
        self.bank: dict = defaultdict(list)
        self._initialize_bank()

    def _initialize_bank(self):
        with Session(create_engine(os.getenv("DATABASE_URL"))) as session:
            query = """
                WITH ls as (
                    SELECT 'l' as kind, l.id_lemma as id, r.wr, l.upostag
                    FROM lemma l
                    JOIN lemma_wr r ON l.id_lemma = r.id_lemma
                    ORDER BY
                        (CASE WHEN l.src_corpus = 'gradit' THEN 0 ELSE 1 END) ASC, -- gradit before additions
                        l.src_key ASC, -- gradit *needs* to sort as X, X_1, X_2, ...
                        (CASE WHEN r.wr = l.label THEN 0 ELSE 1 END) ASC, -- canonical before non-canonical
                        l.gen DESC -- masculine before feminine
                ), hs as (
                    SELECT 'h' as kind, h.id_hypolemma as id, r.wr, ht.upostag
                    FROM hypolemma h
                    JOIN hypolemma_wr r ON h.id_hypolemma = r.id_hypolemma
                    JOIN hypolemmaType ht ON h.type = ht.type
                    ORDER BY
                        (CASE WHEN h.src_corpus = 'gradit' THEN 0 ELSE 1 END) ASC, -- gradit before additions
                        h.src_key ASC, -- gradit *needs* to sort as X, X_1, X_2, ...
                        (CASE WHEN r.wr = h.label THEN 0 ELSE 1 END) ASC -- canonical before non-canonical
                ) (SELECT * FROM ls UNION SELECT * FROM hs)
            """
            rows = session.execute(text(query)).fetchall()
            for kind, id, wr, pos in rows:
                name = "hypo" if kind == "hypolemma" else "lemma"
                uri = f"http://liita.it/data/id/{name}/{id}"
                self.bank[(wr, pos)].append(uri)

    def prelink(self, source: str) -> str:
        doc_dict, comments, empty_sentences = CoNLL.conll2dict(None, source)

        for sentence in doc_dict:
            for token in sentence:
                key = (token.get("lemma"), token.get("upos"))
                links = "LiITALinkedURIs=" + json.dumps(self.bank.get(key, []))
                if "misc" not in token:
                    token["misc"] = links
                else:
                    token["misc"] += "|" + links

        # NOTE: this is modeled after stanza.utils.conll.CoNLL.conll2doc
        document = Document(
            doc_dict, text=None, comments=comments, empty_sentences=empty_sentences
        )

        return "{:C}".format(document)
