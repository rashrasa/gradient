# Gradient

An online learning platform for math, science, and engineering with collaborative demos.

## Development

### Dependencies (Docker Development Environment coming soon)

- [Node 20+](https://nodejs.org/en/download)
- [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)
- [Rust](https://rust-lang.org/tools/install/)

### Run

1. Install application dependencies:

    - pnpm: `pnpm -C ./apps/frontend/ install`

2. Install dotenv

    - pnpm: `pnpm install -g dotenv-cli`

3. Copy .env file: `cp .env.example .env`

4. Start:

- **Frontend**:
  - pnpm: `pnpm -C ./apps/frontend/ run dev`

- **Backend**: `dotenv -e .env -- -- cargo run backend`
