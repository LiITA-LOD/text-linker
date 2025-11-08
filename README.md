# text-linker

LiITA Text Linker - A tool for text tokenization, prelinking, and link editing to aid in preparation of resources for LiITA.

You can use this tool right now at: https://liita-lod.github.io/text-linker/

If you wish to run this tool on your machine you can simply install [Docker](https://www.docker.com/) and start the pre-built images with `docker compose up`. Otherwise, please refer to the development section below.

> [!IMPORTANT]
> To run this tool yourself, will need both direct access to the LiITA internal database and a link to the LiITA Stanza models. These will need to be configured either in the `docker-compose.yml` (if you run it with Docker) or in `apps/backend/.env` (if you follow the development guide below). Simply put, this means you probably won't be able to run the tool on your machine unless you're in the LiITA team.

# Development

## Project Structure

This tool is composed of the following components:

- `apps/frontend/` - React frontend application
- `apps/backend/` - FastAPI backend service

## Requirements

It is recommended to use [nix](https://nix.dev/) and [direnv](https://direnv.net/) and let them take care of requirements.

Otherwise, you will need to install the requirements listed in each component's documentation.

## Getting started

> [!IMPORTANT]
> Each component will need a `.env` to be configured in its folder. Please refer to the documentation of each component for more information. Consider `docker-compose.yaml` as living documentation on how to coordinate the components in case you're confused.

If you're using `nix` you can simply run `mprocs` and a local development environment will be running in a few moments.

Otherwise, you will need to start each component yourself as described in their respective documentation.

