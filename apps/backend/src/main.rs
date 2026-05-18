// NOTE: Ensure to verify identity for HTTP requests

use std::{net::Ipv4Addr, str::FromStr, sync::Arc};

use axum::{Router, extract::State, http::Method, routing::any};
use env_logger::Target;
use log::{LevelFilter, debug};
use tokio::sync::Mutex;

#[derive(Clone, Default)]
struct AppState {
    inner: Arc<Mutex<InnerAppState>>,
}

#[derive(Default)]
struct InnerAppState {
    counter: u64,
}

#[tokio::main]
async fn main() {
    env_logger::builder()
        .filter_level(LevelFilter::max())
        .target(Target::Stdout)
        .init();
    let ip = Ipv4Addr::from_str(
        &std::env::var("GRADIENT_BACKEND_SERVER_IP")
            .expect("GRADIENT_BACKEND_SERVER_IP not set. Cannot start server."),
    )
    .expect("Cannot parse GRADIENT_BACKEND_SERVER_IP into an IPv4 address (x.x.x.x).");
    let port = u16::from_str(
        &std::env::var("GRADIENT_BACKEND_SERVER_PORT")
            .expect("GRADIENT_BACKEND_SERVER_PORT not set. Cannot start server."),
    )
    .expect(
        "Cannot parse GRADIENT_BACKEND_SERVER_PORT. Ensure it's a valid 16-bit unsigned integer.",
    );

    let listener = tokio::net::TcpListener::bind(format!("{}:{}", ip, port))
        .await
        .expect(&format!("Unable to bind to {}:{}", ip, port));

    let router = Router::new()
        .route("/", any(handle_root))
        .with_state(Arc::new(AppState::default()));

    axum::serve(listener, router).await.unwrap();
}

#[axum_macros::debug_handler]
async fn handle_root(method: Method, State(state): State<Arc<AppState>>, body: String) -> String {
    let req_num = {
        let mut state = state.inner.lock().await;
        state.counter += 1;
        state.counter - 1
    };

    let response = format!(
        "Hello request {}! You sent this request with \nMethod: {} \nBody: {}",
        req_num + 1,
        method.as_str(),
        if method != Method::GET {
            body
        } else {
            "<Empty body> (method was GET)".into()
        },
    );

    debug!("{}", response);

    response
}
