FROM rust:1.95

WORKDIR /backend
COPY . .
RUN cargo build --release
EXPOSE 8080
CMD [ "./target/release/backend" ]