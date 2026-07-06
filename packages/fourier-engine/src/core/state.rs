#[derive(Debug, Clone)]
pub struct DigitalSignal {
    samples: Vec<f32>,
    frequency: f32,
}

#[derive(Debug, Clone, Copy)]
pub struct Point2F {
    pub t: f32,
    pub y: f32,
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
