pub mod core;

#[cfg(not(target_arch = "wasm32"))]
pub use core::*;
#[cfg(target_arch = "wasm32")]
use {anyhow::Context, core::FourierEngine, std::cell::RefCell, wasm::*, wasm_bindgen::prelude::*};

#[cfg(target_arch = "wasm32")]
mod wasm;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    #[cfg(target_arch = "wasm32")]
    fn log(s: &str);
}

#[cfg(target_arch = "wasm32")]
thread_local! {
    pub static ENGINE: RefCell<FourierEngine> = RefCell::new(FourierEngine::new());
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
fn run() {
    #[cfg(target_arch = "wasm32")]
    log("Hello from WASM");
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn load_audio_data(data: &[u8]) -> Result<(), String> {
    ENGINE
        .with_borrow_mut(|v| {
            v.load_audio_data(data)
                .context("Failed to decode audio file")
        })
        .map_err(|e| format!("{:?}", e))
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_signal() -> Option<DigitalSignal> {
    ENGINE.with_borrow(|v| v.signal().map(|s| s.into()))
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
/// If ReadableState::SignalLoaded, the signal
/// and fft values can be read.
pub fn get_state() -> ReadableState {
    ENGINE.with_borrow(|v| v.state().into())
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_sorted_fft_result() -> Option<Vec<FFTValue>> {
    ENGINE.with_borrow(|v| {
        v.fft_result().map(|result| {
            result
                .sorted_values()
                .iter()
                .map(|value| value.into())
                .collect()
        })
    })
}
