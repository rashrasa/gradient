FROM rust:1.95

WORKDIR /backend
COPY . .
RUN cargo install --path .
CMD [ "backend" ]