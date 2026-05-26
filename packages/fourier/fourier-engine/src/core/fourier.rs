use crate::{
    MaxVec, Original, Sorted,
    core::{ComplexFloat, DigitalSignal},
};
use std::f32::consts::PI;

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

#[derive(Debug, Clone)]
pub struct FFTResult {
    original_frequency: f32,
    original_sample_count: usize,

    values: MaxVec<FFTValue>,

    reconstructed: Vec<f32>,
}

impl FFTResult {
    pub fn from_signal(signal: &DigitalSignal) -> Self {
        let sampling_frequency = signal.frequency();

        let mut samples = signal
            .samples()
            .iter()
            .map(|s| ComplexFloat::standard(*s, 0.0))
            .collect::<Vec<ComplexFloat>>();
        let original_sample_count = samples.len();
        if !samples.len().is_power_of_two() {
            samples.resize(
                samples.len().next_power_of_two(),
                ComplexFloat::polar(0.0, 0.0),
            );
        }
        let padded_sample_count = samples.len();

        let fft = fft_recursive(&samples);

        let values: Vec<FFTValue> = fft
            .iter()
            .enumerate()
            .map(|(i, z)| FFTValue {
                frequency: i as f32 * sampling_frequency / fft.len() as f32,
                result: *z,
            })
            .collect();

        let values: Vec<FFTValue> = values
            .iter()
            .take((fft.len() as f32 / 2.0 + 1.0) as usize)
            .map(|v| *v)
            .collect();

        let values = MaxVec::new(values, |a, b| b.result.r().total_cmp(&a.result.r()));

        let fft_values: Vec<ComplexFloat> = values.original().map(|v| v.result).collect();
        let reconstructed = inverse_fft(&fft_values, padded_sample_count)
            .iter()
            .map(|v| v.a())
            .take(original_sample_count)
            .collect();

        FFTResult {
            original_frequency: signal.frequency(),
            original_sample_count,
            values,
            reconstructed,
        }
    }
    pub fn original_frequency(&self) -> f32 {
        self.original_frequency
    }

    pub fn original_sample_count(&self) -> usize {
        self.original_sample_count
    }
    pub fn unsorted_values(&self) -> Original<'_, FFTValue> {
        self.values.original()
    }

    pub fn sorted_values(&self) -> Sorted<'_, FFTValue> {
        self.values.sorted()
    }

    pub fn reconstructed(&self) -> &[f32] {
        &self.reconstructed
    }
}

fn fft_recursive(samples: &[ComplexFloat]) -> Vec<ComplexFloat> {
    assert!(samples.len().is_power_of_two());
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

fn inverse_fft(values: &[ComplexFloat], sample_count: usize) -> Vec<ComplexFloat> {
    let conjugate_values: Vec<ComplexFloat> = values
        .iter()
        .map(|v| {
            // Calculate Conjugate
            ComplexFloat::standard(v.a(), -v.b())
        })
        .collect();

    let result: Vec<ComplexFloat> = fft_recursive(&conjugate_values)
        .iter()
        .map(|v| ComplexFloat::standard(v.a(), -v.b()) / sample_count as f32)
        .collect();

    result
}

#[cfg(test)]
mod tests {
    use approx::assert_relative_eq;

    use crate::core::Function;

    use super::*;

    #[test]
    fn inverse_fft_recovers_signal() {
        let frequency: f32 = 200.0;
        let function = Function::new(|x| 3.0 * (3.0 * x).sin() + 9.0 * (PI / 4.0 * x).sin());
        let mut samples = function.sample(0.0, 5.0, frequency);
        if !samples.len().is_power_of_two() {
            samples.resize(samples.len().next_power_of_two(), 0.0);
        }
        let sample_count = samples.len();

        let samples_complex = samples
            .iter()
            .map(|v| ComplexFloat::standard(*v, 0.0))
            .collect::<Vec<ComplexFloat>>();

        let fft_values: Vec<ComplexFloat> = fft_recursive(&samples_complex);

        let expected: Vec<ComplexFloat> = samples_complex;
        let actual = inverse_fft(&fft_values, sample_count);

        for i in 0..sample_count {
            assert_relative_eq!(expected[i].a(), actual[i].a(), epsilon = 1.0e-4);
        }
    }

    #[test]
    fn inverse_fft_calculates_correct_result() {
        let frequency: f32 = 200.0;
        let function = Function::new(|x| 3.0 * (3.0 * x).sin() + 9.0 * (PI / 4.0 * x).sin());
        let mut samples = function.sample(0.0, 5.0, frequency);
        if !samples.len().is_power_of_two() {
            samples.resize(samples.len().next_power_of_two(), 0.0);
        }
        let sample_count = samples.len();
        let fft_values: Vec<ComplexFloat> = fft_recursive(
            &samples
                .iter()
                .map(|v| ComplexFloat::standard(*v, 0.0))
                .collect::<Vec<ComplexFloat>>(),
        );

        let ifft_values = inverse_fft(&fft_values, sample_count);
        let mut planner = rustfft::FftPlanner::new();
        let ifft = planner.plan_fft_inverse(sample_count);

        let mut expected: Vec<rustfft::num_complex::Complex<f32>> = fft_values
            .iter()
            .map(|z| rustfft::num_complex::Complex {
                re: z.a(),
                im: z.b(),
            })
            .collect();

        ifft.process(&mut expected);
        let actual = ifft_values;

        for i in 0..sample_count {
            assert_relative_eq!(
                expected[i].re / sample_count as f32,
                actual[i].a(),
                epsilon = 1.0e-4
            );
            assert_relative_eq!(
                expected[i].im / sample_count as f32,
                actual[i].b(),
                epsilon = 1.0e-4
            );
        }
    }
}
