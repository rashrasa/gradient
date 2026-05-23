use std::f32::consts::PI;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::core::{ComplexFloat, DigitalSignal};

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct FFTValue {
    frequency: f32,
    result: ComplexFloat,
}

impl FFTValue {
    pub fn new(f: f32, z: ComplexFloat) -> Self {
        Self {
            frequency: f,
            result: z,
        }
    }
    pub fn frequency(&self) -> f32 {
        self.frequency
    }
    pub fn result(&self) -> ComplexFloat {
        self.result
    }
}

pub struct FFTResult {
    sorted_values: Vec<FFTValue>,
}

impl FFTResult {
    pub fn from_signal(signal: &DigitalSignal) -> Self {
        let samples = signal.samples().to_vec();
        let sampling_frequency = signal.frequency();

        let fft = fft_recursive(
            &samples
                .iter()
                .map(|s| ComplexFloat::standard(*s, 0.0))
                .collect::<Vec<ComplexFloat>>(),
        );

        let mut sorted_values: Vec<FFTValue> = fft
            .iter()
            .enumerate()
            .map(|(i, z)| FFTValue {
                frequency: i as f32 * sampling_frequency / fft.len() as f32,
                result: *z,
            })
            .collect();

        sorted_values.sort_by(|a, b| a.result.r().total_cmp(&b.result.r()));

        FFTResult { sorted_values }
    }

    pub fn sorted_values(&self) -> &[FFTValue] {
        &self.sorted_values
    }
}

fn fft_recursive(samples: &[ComplexFloat]) -> Vec<ComplexFloat> {
    let n = samples.len();
    if n <= 1 {
        return samples.to_vec();
    }

    let m = n / 2;
    let mut even_t = vec![ComplexFloat::standard(0.0, 0.0); m];
    let mut odd_t = vec![ComplexFloat::standard(0.0, 0.0); m];
    for i in 0..m {
        even_t[i] = samples[2 * i];
        odd_t[i] = samples[2 * i + 1];
    }

    let even_f = fft_recursive(&even_t);
    let odd_f = fft_recursive(&odd_t);

    let mut bins = vec![ComplexFloat::standard(0.0, 0.0); n];

    for k in 0..n / 2 {
        let c_k: ComplexFloat =
            ComplexFloat::polar(1.0, -2.0 * PI * k as f32 / n as f32) * odd_f[k];
        bins[k] = even_f[k] + c_k;
        bins[k + n / 2] = even_f[k] - c_k;
    }

    bins
}
