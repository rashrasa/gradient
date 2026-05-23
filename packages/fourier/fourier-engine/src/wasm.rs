// Contains WASM-compatible types/conversions
// Mainly for separation of concerns

use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct ComplexFloat {
    #[wasm_bindgen]
    pub r: f32,
    #[wasm_bindgen]
    pub theta: f32,
}

#[wasm_bindgen]
pub struct FFTValue {
    #[wasm_bindgen]
    pub frequency: f32,
    #[wasm_bindgen]
    pub amplitude: f32,
    #[wasm_bindgen]
    pub phase: f32,
}

#[wasm_bindgen]
pub enum ReadableState {
    Ready,
    SignalLoaded,
}

#[wasm_bindgen]
pub struct DigitalSignal {
    pub frequency: f32,
    amplitudes: Vec<f32>,
}

#[wasm_bindgen]
impl DigitalSignal {
    #[wasm_bindgen]
    pub fn amplitudes(&self) -> Vec<f32> {
        self.amplitudes.clone()
    }
}

impl From<&crate::core::ComplexFloat> for ComplexFloat {
    fn from(value: &crate::core::ComplexFloat) -> Self {
        Self {
            r: value.r(),
            theta: value.theta(),
        }
    }
}

impl From<&crate::core::FFTValue> for FFTValue {
    fn from(value: &crate::core::FFTValue) -> Self {
        Self {
            frequency: value.frequency(),
            amplitude: value.result().r(),
            phase: value.result().theta(),
        }
    }
}

impl From<&crate::core::State> for ReadableState {
    fn from(value: &crate::core::State) -> Self {
        match value {
            crate::core::State::Ready => ReadableState::Ready,
            crate::core::State::SignalLoaded(_, _) => ReadableState::SignalLoaded,
        }
    }
}

impl From<&crate::core::DigitalSignal> for DigitalSignal {
    fn from(value: &crate::core::DigitalSignal) -> Self {
        Self {
            frequency: value.frequency(),
            amplitudes: value.samples().to_vec(),
        }
    }
}
