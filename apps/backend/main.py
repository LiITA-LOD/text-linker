import logging
import sys
import os
from typing import Literal
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from lib.tokenizer import TokenizerService
from lib.prelinker import PrelinkerService

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
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
    target = app.state.tokenizer_service.tokenize(request.source, request.format)
    return TokenizerResponse(target=target, format="conllu")


class PrelinkerRequest(BaseModel):
    source: str = Field(..., description="Text to prelink", min_length=1)
    format: Literal["conllu"] = Field(..., description="Source format")


class PrelinkerResponse(BaseModel):
    target: str = Field(..., description="Prelinked text")
    format: Literal["conllu"] = Field(..., description="Target format")


@app.post("/prelinker", response_model=PrelinkerResponse)
async def prelinker(request: PrelinkerRequest):
    target = app.state.prelinker_service.prelink(request.source)
    return PrelinkerResponse(target=target, format="conllu")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        log_level=os.getenv("LOG_LEVEL", "info"),
        access_log=True,
    )
