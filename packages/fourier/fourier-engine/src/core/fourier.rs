use std::f32::consts::PI;

use crate::core::ComplexFloat;

pub struct FFTResult {
    values: Vec<ComplexFloat>,
}

impl FFTResult {
    pub fn from_signal(samples: &[f32]) -> Self {
        let samples = samples.to_vec();
        let values = fft_recursive(
            &samples
                .iter()
                .map(|s| ComplexFloat::standard(*s, 0.0))
                .collect::<Vec<ComplexFloat>>(),
        );
        FFTResult { values }
    }

    pub fn values(&self) -> &[ComplexFloat] {
        &self.values
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
