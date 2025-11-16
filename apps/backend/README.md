# text-linker/backend

## Requirements

It is recommended to use [nix](https://nix.dev/) and [direnv](https://direnv.net/) and let them take care of requirements.

Otherwise, you will need to have the following tools installed:

- [uv](https://github.com/astral-sh/uv)

## Setup

Install the dependencies:

```bash
uv sync
```

## Get started

Copy `.env.example` to `.env` and configure the environment variables as needed.

Start the dev server, and the API will be available at [http://localhost:8090](http://localhost:8090).

```bash
uv run --env-file .env main.py
```

The API documentation is available at [http://localhost:8090/docs](http://localhost:8090/docs).

