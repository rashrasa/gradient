# Gradient

An online learning platform for math, science, and engineering with collaborative demos.

## Development

### Docker Development

1. Ensure Docker and Docker Compose are installed

2. `cp .env.dev.example .env.dev`, fill out any sections marked with "REQUIRED"

3. Start a local Supabase server `supabase start -x "vector"`

4. Generate supabase helper types `supabase gen types typescript --local > apps/frontend/src/lib/supabase/database.types.ts`

5. Start development server `docker compose --env-file .env.dev -f docker-compose.dev.yaml up --watch` (may require elevated permissions)

Watch supports:

- frontend-dev

Other services need to be manually restarted with:

`docker compose -f docker-compose.dev.yaml restart <service-name>`

### (OLD) Manual Development

#### Dependencies

- [Node 20+](https://nodejs.org/en/download)
- [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)
- [Rust](https://rust-lang.org/tools/install/)

#### Run

1. Install application dependencies:

    - pnpm: `pnpm -C ./apps/frontend/ install`

2. Install dotenv

    - pnpm: `pnpm install -g dotenv-cli`

3. Copy .env file: `cp .env.example .env`

4. Start:

- **Frontend**:
  - pnpm: `dotenv -e ../../.env -- -- pnpm -C ./apps/frontend/ run dev`

- **Backend**: `dotenv -e .env -- -- cargo run backend`
