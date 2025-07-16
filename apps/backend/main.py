import logging
import sys
import os
from typing import Literal
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from lib.tokenizer import TokenizerService
from lib.prelinker import PrelinkerService

MAX_REQUEST_CONTENT_LENGTH = int(os.getenv("MAX_REQUEST_CONTENT_LENGTH", 10 * 2**20))
MAX_TOKENIZER_SOURCE_LENGTH = int(os.getenv("MAX_TOKENIZER_SOURCE_LENGTH", 100_000))
MAX_PRELINKER_SOURCE_LENGTH = int(os.getenv("MAX_PRELINKER_SOURCE_LENGTH", 1_000_000))

DEFAULT_RATE_LIMIT = os.getenv("DEFAULT_RATE_LIMIT", "1/second")
TOKENIZER_RATE_LIMIT = os.getenv("TOKENIZER_RATE_LIMIT", "6/minute")
PRELINKER_RATE_LIMIT = os.getenv("PRELINKER_RATE_LIMIT", "12/minute")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.tokenizer_service = TokenizerService()
    app.state.prelinker_service = PrelinkerService()
    yield  # NOTE: startup (cleanup) goes before (after) the yield


app = FastAPI(
    title="LiITA Text Linker API",
    description="API for text tokenization and prelinking",
    version="0.1.0",
    lifespan=lifespan,
)

limiter = Limiter(key_func=get_remote_address, default_limits=[DEFAULT_RATE_LIMIT])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_size_middleware(request: Request, call_next):
    if request.method == "POST":
        if not (content_length := request.headers.get("content-length")):
            raise HTTPException(
                status_code=411,
                detail="Content-Length header is missing",
            )

        if not content_length.isdecimal():
            raise HTTPException(
                status_code=400,
                detail="Content-Length header is invalid",
            )

        if (size := int(content_length)) > MAX_REQUEST_CONTENT_LENGTH:
            raise HTTPException(
                status_code=413,
                detail=f"Request size {size} exceeds {MAX_REQUEST_CONTENT_LENGTH} bytes limit",
            )

    response = await call_next(request)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exception: Exception):
    logger.error(exception, exc_info=True)
    raise HTTPException(status_code=500)


@app.get("/")
async def root():
    return {"status": "ok"}


class TokenizerRequest(BaseModel):
    source: str = Field(
        ...,
        description="Text to tokenize",
        min_length=1,
        max_length=MAX_TOKENIZER_SOURCE_LENGTH,
    )
    format: Literal["plain", "conllu"] = Field("plain", description="Source format")


class TokenizerResponse(BaseModel):
    target: str = Field(..., description="Tokenized text")
    format: Literal["conllu"] = Field(..., description="Target format")


@app.post("/tokenizer", response_model=TokenizerResponse)
@limiter.limit(TOKENIZER_RATE_LIMIT)
async def tokenizer(request: Request, tokenizer_request: TokenizerRequest):
    target = app.state.tokenizer_service.tokenize(
        tokenizer_request.source, tokenizer_request.format
    )
    return TokenizerResponse(target=target, format="conllu")


class PrelinkerRequest(BaseModel):
    source: str = Field(
        ...,
        description="Text to prelink",
        min_length=1,
        max_length=MAX_PRELINKER_SOURCE_LENGTH,
    )
    format: Literal["conllu"] = Field(..., description="Source format")


class PrelinkerResponse(BaseModel):
    target: str = Field(..., description="Prelinked text")
    format: Literal["conllu"] = Field(..., description="Target format")


@app.post("/prelinker", response_model=PrelinkerResponse)
@limiter.limit(PRELINKER_RATE_LIMIT)
async def prelinker(request: Request, prelinker_request: PrelinkerRequest):
    target = app.state.prelinker_service.prelink(prelinker_request.source)
    return PrelinkerResponse(target=target, format="conllu")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        log_level=os.getenv("LOG_LEVEL", "info"),
        access_log=True,
        reload=os.getenv("UVICORN_RELOAD", "false").lower() == "true",
    )
