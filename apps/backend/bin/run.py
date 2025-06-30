#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.13"
# dependencies = ["stanza>=1.10.1"]
# ///

import argparse
# import logging
import sys

import stanza
from stanza.utils.conll import CoNLL

# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s",
#     handlers=[logging.StreamHandler(sys.stdout)],
# )
#
# logger = logging.getLogger(__name__)

def core(model_path: str, source_path: str, target_path: str, format_type: str) -> None:
    if format_type == "conllu":
        tokenize_pretokenized = True
        doc = CoNLL.conll2doc(source_path)
    elif format_type == "plain":
        tokenize_pretokenized = False
        with open(source_path, 'r') as f:
            doc = f.read()
    else:
        raise ValueError

    nlp = stanza.Pipeline(
        lang='it',
        dir=model_path,
        download_method=None,
        processors='tokenize,pos,lemma,depparse',
        tokenize_pretokenized=tokenize_pretokenized,
    )
    CoNLL.write_doc2conll(nlp(doc), target_path)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", dest="model_path", required=True)
    parser.add_argument("--source", dest="source_path", required=True)
    parser.add_argument("--target", dest="target_path", required=True)
    parser.add_argument("--format", dest="format_type", choices=["plain", "conllu"])
    args = parser.parse_args()

    core(args.model_path, args.source_path, args.target_path, args.format_type)

if __name__ == "__main__":
    main()
