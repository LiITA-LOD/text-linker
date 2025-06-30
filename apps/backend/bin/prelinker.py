#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "stanza>=1.10.1",
#   "sqlalchemy>=2.0.41",
#   "pymysql>=1.1.1",
# ]
# ///

import argparse
import json
import os
from collections import defaultdict

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from stanza.utils.conll import CoNLL
from stanza.models.common.doc import Document


def fetch_words():
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
        word_dict = defaultdict(list)
        for kind, id, wr, pos in rows:
            uri = f"http://liita.it/data/id/{'hypo' if kind == 'h' else ''}lemma/{id}"
            word_dict[(wr, pos)].append(uri)
    return word_dict


def core(source_path: str, target_path: str) -> None:
    words = fetch_words()

    doc_dict, doc_comments, doc_empty = CoNLL.conll2dict(source_path)

    for sentence in doc_dict:
        for token in sentence:
            key = (token.get("text"), token.get("upos"))
            links = "LiITA=" + json.dumps(words.get(key, []))
            if "misc" not in token:
                token["misc"] = links
            else:
                token["misc"] += "|" + links

    doc = Document(  # NOTE: this is modeled after stanza.utils.conll.CoNLL.conll2doc
        doc_dict, text=None, comments=doc_comments, empty_sentences=doc_empty
    )

    CoNLL.write_doc2conll(doc, target_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", dest="source_path", required=True)
    parser.add_argument("--target", dest="target_path", required=True)
    args = parser.parse_args()

    core(args.source_path, args.target_path)


if __name__ == "__main__":
    main()
