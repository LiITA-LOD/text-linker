#!/usr/bin/env -S uv run --script

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib.prelinker import PrelinkerService


def core(source_path: str, target_path: str) -> None:
    prelinker_service = PrelinkerService()

    with open(source_path, "r") as f:
        source = f.read()

    target = prelinker_service.prelink(source)

    with open(target_path, "w") as f:
        f.write(target)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", dest="source_path", required=True)
    parser.add_argument("--target", dest="target_path", required=True)
    args = parser.parse_args()

    core(args.source_path, args.target_path)


if __name__ == "__main__":
    main()
