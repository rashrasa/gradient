pub struct Function {
    f: fn(f32) -> f32,
}

impl Function {
    pub fn new(f: fn(f32) -> f32) -> Self {
        return Function { f };
    }
    pub fn sample(&self, start: f32, end: f32, freq: f32) -> Vec<f32> {
        let mut samples = vec![];
        let period = 1.0 / freq;

        let mut t = start;
        while t < end {
            let sample = (self.f)(t);
            samples.push(sample);
            t += period;
        }
        samples
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;
    use std::f32::consts::PI;

    #[test]
    fn sample_cosine_returns_expected() {
        let start = 0.0;
        let end = 4.0 * (1.0 + f32::EPSILON);
        let freq = 1.0;

        let f: fn(f32) -> f32 = |t| (t * PI / 2.0).cos();

        let samples = Function::new(f).sample(start, end, freq);

        assert_eq!(samples.len(), 5);
        assert_relative_eq!(samples[0], 1.0);
        assert_relative_eq!(samples[1], 0.0);
        assert_relative_eq!(samples[2], -1.0);
        assert_relative_eq!(samples[3], 0.0);
        assert_relative_eq!(samples[4], 1.0);
    }

    #[test]
    fn samples_are_stable() {
        let start = 0.0;
        let end = 44000.0;
        let freq = 100.0;

        let samples = Function::new(|t| t.sin()).sample(start, end, freq);

        let sum: f32 = samples.iter().sum();
        let avg = sum / samples.len() as f32;

        assert_relative_eq!(avg, 0.0, epsilon = 1.0e-4);
    }
}
