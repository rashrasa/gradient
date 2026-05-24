# Dependencies

## Rust

FROM rust:1.95 AS cargo-chef
RUN cargo install --locked cargo-chef
WORKDIR /app

FROM cargo-chef AS cargo-chef-wasm
RUN cargo install --locked wasm-pack
RUN rustup target add wasm32-unknown-unknown

### Native

FROM cargo-chef AS native-planner
COPY docker/native.Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY packages/fourier/fourier-engine packages/fourier/fourier-engine
COPY apps/backend apps/backend
RUN cargo chef prepare --recipe-path recipe.json

FROM cargo-chef AS native-builder-prod
COPY --from=native-planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY docker/native.Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY packages/fourier/fourier-engine packages/fourier/fourier-engine
COPY apps/backend apps/backend
RUN cargo build --release -p backend

FROM cargo-chef AS native-builder-dev
COPY --from=native-planner /app/recipe.json recipe.json
RUN cargo chef cook --recipe-path recipe.json
COPY docker/native.Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY packages/fourier/fourier-engine packages/fourier/fourier-engine
COPY apps/backend apps/backend
RUN cargo build -p backend

### WASM

FROM cargo-chef-wasm AS wasm-planner
COPY docker/wasm.Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY packages/fourier/fourier-engine packages/fourier/fourier-engine
RUN cargo chef prepare --recipe-path recipe.json

FROM cargo-chef-wasm AS wasm-builder-prod
COPY --from=wasm-planner /app/recipe.json recipe.json
RUN cargo chef cook --release --target wasm32-unknown-unknown --recipe-path recipe.json
COPY docker/wasm.Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY packages/fourier/fourier-engine packages/fourier/fourier-engine
RUN wasm-pack build packages/fourier/fourier-engine --target bundler --release

FROM cargo-chef-wasm AS wasm-builder-dev
COPY --from=wasm-planner /app/recipe.json recipe.json
RUN cargo chef cook --target wasm32-unknown-unknown --recipe-path recipe.json
COPY docker/wasm.Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY packages/fourier/fourier-engine packages/fourier/fourier-engine
RUN wasm-pack build packages/fourier/fourier-engine --target bundler

## Node

FROM ghcr.io/pnpm/pnpm:latest AS node-deps
RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY apps/frontend apps/frontend
COPY docker/fourier-engine-package.json apps/frontend/packages/fourier-engine/package.json
RUN pnpm install --frozen-lockfile -C apps/frontend

FROM node-deps AS next-builder-prod
COPY --from=wasm-builder-prod /app/packages/fourier/fourier-engine/pkg apps/frontend/packages/fourier-engine
RUN pnpm run -C apps/frontend build

FROM node-deps AS next-builder-dev
COPY --from=wasm-builder-dev /app/packages/fourier/fourier-engine/pkg apps/frontend/packages/fourier-engine

# Services

## Frontend

FROM node:26-slim AS gradient-frontend-prod
WORKDIR /app
COPY --from=next-builder-prod /app/apps/frontend/.next/standalone .
COPY --from=next-builder-prod /app/apps/frontend/.next/static ./.next/static
COPY --from=next-builder-prod /app/apps/frontend/public ./public
ENTRYPOINT [ "node" ]
CMD [ "server.js" ]

## Backend

FROM debian:trixie-slim AS gradient-backend-prod
WORKDIR /app
COPY --from=native-builder-prod /app/target/release/backend /usr/local/bin/app
ENTRYPOINT [ "/usr/local/bin/app" ]


# Dev Services

FROM next-builder-dev AS gradient-frontend-dev
WORKDIR /app/apps/frontend
ENTRYPOINT [ "pnpm" ]
CMD [ "run", "dev" ]

FROM native-builder-dev AS gradient-backend-dev
ENTRYPOINT [ "cargo" ]
CMD [ "run", "-p", "backend" ]