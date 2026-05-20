FROM ghcr.io/pnpm/pnpm:latest
RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY apps/frontend apps/frontend
RUN pnpm install --frozen-lockfile -C apps/frontend
RUN pnpm run -C apps/frontend build
EXPOSE 3000
CMD [ "pnpm", "run", "-C", "apps/frontend", "start" ]