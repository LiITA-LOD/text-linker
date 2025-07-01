import logging
import sys
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from tokenizer import TokenizerService
from prelinker import PrelinkerService

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
    target = tokenizer_service.tokenize(request.source, request.format)
    return TokenizerResponse(target=target, format="conllu")


class PrelinkerRequest(BaseModel):
    source: str = Field(..., description="Text to prelink", min_length=1)
    format: Literal["conllu"] = Field(..., description="Source format")


class PrelinkerResponse(BaseModel):
    target: str = Field(..., description="Prelinked text")
    format: Literal["conllu"] = Field(..., description="Target format")


@app.post("/prelinker", response_model=PrelinkerResponse)
async def prelinker(request: PrelinkerRequest):
    target = prelinker_service.prelink(request.source)
    return PrelinkerResponse(target=target, format="conllu")


def main():
    try:
        model_path = "./LiITA_model"  # TODO: configure via env for prd
        global tokenizer_service
        tokenizer_service = TokenizerService(model_path)
        global prelinker_service
        prelinker_service = PrelinkerService()
    except Exception as e:
        logger.error(f"Failed to initialize pipelines: {e}")
        sys.exit(1)

    try:
        uvicorn.run(  # TODO: configure via env for prd
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            access_log=True,
            reload=False,
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
