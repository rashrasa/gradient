pub struct DigitalSignal {
    frequency: u32,
    samples: Vec<f32>,
    // dur = samples.len / frequency
}
impl DigitalSignal {
    pub fn new(frequency: u32, samples: Vec<f32>) -> Self {
        DigitalSignal { frequency, samples }
    }

    pub fn samples(&self) -> &[f32] {
        &self.samples
    }

    pub fn frequency(&self) -> u32 {
        self.frequency
    }
}
