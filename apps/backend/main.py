#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "fastapi>=0.104.0",
#     "uvicorn[standard]>=0.24.0",
#     "pydantic>=2.5.0"
# ]
# ///

import logging
import sys
from typing import Any, Dict, Optional, Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="LiITA Text Linker API",
    description="API for text tokenization and prelinking",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: configure for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exception: Exception):
    logger.error(exception, exc_info=True)
    raise HTTPException(status_code=500)


@app.get("/")
async def root():
    return {"status": "ok"}


class TokenizerRequest(BaseModel):
    source: str = Field(..., description="Text to tokenize", min_length=1)
    format: Literal["plain", "conllu"] = Field("plain", description="Source format")


class TokenizerResponse(BaseModel):
    target: str = Field(..., description="Tokenized text")
    format: Literal["conllu"] = Field(..., description="Target format")


@app.post("/tokenizer", response_model=TokenizerResponse)
async def tokenizer(request: TokenizerRequest):
    if request.format == "plain":
        target = tokenize_plain_text(request.source)
    elif request.format == "conllu":
        target = process_conllu(request.source)
    return TokenizerResponse(target=target, format="conllu")


class PrelinkerRequest(BaseModel):
    source: str = Field(..., description="Text to prelink", min_length=1)
    format: Literal["conllu"] = Field(..., description="Source format")


class PrelinkerResponse(BaseModel):
    target: str = Field(..., description="Prelinked text")
    format: Literal["conllu"] = Field(..., description="Target format")


@app.post("/prelinker", response_model=PrelinkerResponse)
async def prelinker(request: PrelinkerRequest):
    target = prelink_conllu(request.source)
    return PrelinkerResponse(target=target, format="conllu")


def tokenize_plain_text(source: str) -> str:
    target = source
    return target


def process_conllu(source: str) -> str:
    target = source
    return target


def prelink_conllu(source: str) -> str:
    target = source
    return target


def main():
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",  # Bind to all interfaces
            port=8000,
            log_level="info",
            access_log=True,
            reload=False,  # Set to True for development
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
