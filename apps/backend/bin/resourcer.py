#!/usr/bin/env -S uv run --script

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib.resourcer import Resourcer


def core(source_url: str, target_dir: str) -> None:
    resourcer_service = Resourcer(source_url, target_dir)
    resourcer_service.download_and_extract_model()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", dest="source_url")
    parser.add_argument("--dir", dest="target_dir")
    args = parser.parse_args()

    core(args.source_url, args.target_dir)


if __name__ == "__main__":
    main()
