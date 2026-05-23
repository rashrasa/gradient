pub struct DigitalSignal {
    frequency: f32,
    samples: Vec<f32>,
    // dur = samples.len / frequency
}
impl DigitalSignal {
    pub fn new(frequency: f32, samples: Vec<f32>) -> Self {
        DigitalSignal { frequency, samples }
    }

    pub fn samples(&self) -> &[f32] {
        &self.samples
    }

    pub fn frequency(&self) -> f32 {
        self.frequency
    }
}
