pub mod core;

use crate::core::{DigitalSignal, FFTValue, FourierEngine, State};
use anyhow::Context;
use std::cell::RefCell;
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
thread_local! {
    pub static ENGINE: RefCell<FourierEngine> = RefCell::new(FourierEngine::new());
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
    ENGINE.with_borrow(|v| v.get_signal().map(|s| s.clone()))
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
/// If ReadableState::SignalLoaded, the signal
/// and fft values can be read.
pub fn get_state() -> ReadableState {
    ENGINE.with_borrow(|v| match v.state() {
        State::Ready => ReadableState::Ready,
        State::SignalLoaded(_, _) => ReadableState::SignalLoaded,
    })
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn get_sorted_fft_values() -> Option<Vec<FFTValue>> {
    ENGINE.with_borrow(|v| v.get_fft_values())
}

#[wasm_bindgen]
pub enum ReadableState {
    Ready,
    SignalLoaded,
}
