#!/usr/bin/env -S uv run --script

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib.tokenizer import TokenizerService


def core(source_path: str, target_path: str, format_type: str) -> None:
    tokenizer_service = TokenizerService()

    with open(source_path, "r") as f:
        source = f.read()

    target = tokenizer_service.tokenize(source, format_type)

    with open(target_path, "w") as f:
        f.write(target)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", dest="source_path", required=True)
    parser.add_argument("--target", dest="target_path", required=True)
    parser.add_argument("--format", dest="format_type", choices=["plain", "conllu"])
    args = parser.parse_args()

    core(args.source_path, args.target_path, args.format_type)


if __name__ == "__main__":
    main()
