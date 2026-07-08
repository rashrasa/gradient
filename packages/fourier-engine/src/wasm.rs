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
    pub frequency: u32,
    samples: Vec<f32>,
}

#[wasm_bindgen]
impl DigitalSignal {
    #[wasm_bindgen]
    pub fn samples(&self) -> Vec<f32> {
        self.samples.clone()
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Point2F {
    pub t: f32,
    pub y: f32,
}

#[wasm_bindgen]
pub struct SignalLoadedAdditional {
    pub original_signal_domain: Point2F,
    pub original_signal_range: Point2F,
}

#[wasm_bindgen]
pub struct PlayablePartial {
    freqs: Vec<usize>,
    wav: Vec<u8>,
}

#[wasm_bindgen]
impl PlayablePartial {
    #[wasm_bindgen]
    pub fn wav(&self) -> Vec<u8> {
        self.wav.clone()
    }

    #[wasm_bindgen]
    pub fn freqs(&self) -> Vec<usize> {
        self.freqs.clone()
    }
}

impl From<&crate::core::PlayablePartial> for PlayablePartial {
    fn from(value: &crate::core::PlayablePartial) -> Self {
        Self {
            freqs: value.freqs.clone(),
            wav: value.wav.clone(),
        }
    }
}

#[wasm_bindgen]
impl Point2F {
    #[wasm_bindgen(constructor)]
    pub fn new(t: f32, y: f32) -> Self {
        Self { t, y }
    }
}

#[wasm_bindgen]
impl SignalLoadedAdditional {
    #[wasm_bindgen(constructor)]
    pub fn new(original_domain: Point2F, original_range: Point2F) -> Self {
        Self {
            original_signal_domain: original_domain,
            original_signal_range: original_range,
        }
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
            crate::core::State::SignalLoaded(..) => ReadableState::SignalLoaded,
        }
    }
}

impl From<&crate::core::Point2F> for Point2F {
    fn from(value: &crate::core::Point2F) -> Self {
        Self {
            t: value.t,
            y: value.y,
        }
    }
}

impl From<&crate::core::DigitalSignal> for DigitalSignal {
    fn from(value: &crate::core::DigitalSignal) -> Self {
        Self {
            frequency: value.frequency(),
            samples: value.samples().to_vec(),
        }
    }
}

impl From<&[f32; 2]> for Point2F {
    fn from(value: &[f32; 2]) -> Self {
        Self {
            t: value[0],
            y: value[1],
        }
    }
}

impl From<&crate::core::SignalLoadedAdditional> for SignalLoadedAdditional {
    fn from(value: &crate::core::SignalLoadedAdditional) -> Self {
        Self {
            original_signal_domain: (&value.original_signal_domain).into(),
            original_signal_range: (&value.original_signal_range).into(),
        }
    }
}
