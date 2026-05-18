FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04 AS builder

COPY --from=ghcr.io/astral-sh/uv:0.7.3 /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_SYSTEM_SITE_PACKAGES=1 \
    UV_LINK_MODE=copy

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libglib2.0-0 \
    libgl1

COPY pyproject.toml uv.lock ./

RUN uv python install 3.10
RUN uv sync --frozen --no-dev

COPY src ./src

EXPOSE 8333

CMD ["uv", "run", "fastapi", "run", "src/main.py", "--host", "0.0.0.0", "--port", "8333"]
