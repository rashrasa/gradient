pub mod core;

use core::FourierEngine;

#[cfg(target_arch = "wasm32")]
use anyhow::Context;

#[cfg(target_arch = "wasm32")]
use std::cell::RefCell;

#[cfg(target_arch = "wasm32")]
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
