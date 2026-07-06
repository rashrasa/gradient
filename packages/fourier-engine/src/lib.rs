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
    console_error_panic_hook::set_once();
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn unload() {
    console_error_panic_hook::set_once();
    ENGINE.with_borrow_mut(|v| v.unload())
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn load_audio_data(data: &[u8]) -> Result<(), String> {
    console_error_panic_hook::set_once();
    ENGINE
        .with_borrow_mut(|v| {
            v.load_audio_data(data)
                .context("Failed to decode audio file")
        })
        .map_err(|e| format!("Fourier Engine (WASM) Error: {:?}", e))
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_signal() -> Option<DigitalSignal> {
    console_error_panic_hook::set_once();
    ENGINE.with_borrow(|v| v.try_loaded().map(|a| (&a.signal).into()))
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
/// If ReadableState::SignalLoaded, the signal
/// and fft values can be read.
pub fn get_state() -> ReadableState {
    console_error_panic_hook::set_once();
    ENGINE.with_borrow(|v| v.state().into())
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_sorted_fft_result() -> Option<Vec<FFTValue>> {
    console_error_panic_hook::set_once();
    ENGINE.with_borrow(|v| {
        v.try_loaded()
            .map(|a| a.fft.sorted_values().map(|v| v.into()).collect())
    })
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_fft_result() -> Option<Vec<FFTValue>> {
    console_error_panic_hook::set_once();
    ENGINE.with_borrow(|v| {
        v.try_loaded()
            .map(|a| a.fft.unsorted_values().map(|v| v.into()).collect())
    })
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_wav_original() -> Option<Vec<u8>> {
    console_error_panic_hook::set_once();
    ENGINE.with_borrow(|v| v.try_loaded().map(|a| a.playable.original_wav.clone()))
}
