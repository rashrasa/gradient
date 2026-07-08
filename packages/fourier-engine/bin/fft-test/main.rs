use std::{f32::consts::PI, io::Write, path::Path};

use anyhow::Context;
use fourier_engine::core::{DigitalSignal, FFTResult, FFTValue, Function};

const FREQUENCY: u32 = 440;
const DURATION: f32 = 5.0;
const AMPLITUDE: f32 = 0.5;

const SAMPLING_FREQUENCY: u32 = 44100;
const SAMPLING_PERIOD: f32 = 1.0 / FREQUENCY as f32;

fn main() -> anyhow::Result<()> {
    let samples = Function::new(|x| AMPLITUDE * (2.0 * PI * FREQUENCY as f32 * x).sin()).sample(
        0.0,
        DURATION,
        SAMPLING_FREQUENCY as f32,
    );
    let signal = DigitalSignal::new(SAMPLING_FREQUENCY, samples.clone());
    let result = FFTResult::from_signal(&signal);
    let fft: Vec<FFTValue> = result.sorted_values().copied().collect();

    std::fs::create_dir_all("packages/fourier-engine/bin/fft-test/result").unwrap();

    let mut signal_file =
        std::fs::File::create("packages/fourier-engine/bin/fft-test/result/signal.tsv")
            .context("Failed to write file.")?;

    signal_file.write_all(b"time\tamplitude\n").unwrap();

    let mut fft_file = std::fs::File::create("packages/fourier-engine/bin/fft-test/result/fft.tsv")
        .context("Failed to write file.")?;
    fft_file.write_all(b"frequency\tamplitude\n").unwrap();

    for (i, s) in signal.samples().iter().enumerate() {
        signal_file
            .write_all(&format!("{}\t{}\n", i as f32 * SAMPLING_PERIOD, *s).into_bytes())
            .unwrap();
    }
    for f in fft.iter().take(fft.len() / 2) {
        fft_file
            .write_all(&format!("{}\t{}\n", f.frequency(), f.result().r()).into_bytes())
            .unwrap();
    }

    signal_file.flush().unwrap();
    fft_file.flush().unwrap();

    write_samples(
        result.reconstructed(),
        SAMPLING_FREQUENCY,
        "packages/fourier-engine/bin/fft-test/result/reconstructed.wav",
    );

    write_samples(
        &samples,
        SAMPLING_FREQUENCY,
        "packages/fourier-engine/bin/fft-test/result/original.wav",
    );

    Ok(())
}

fn write_samples(samples: &[f32], frequency: u32, path: impl AsRef<Path>) {
    let spec = hound::WavSpec {
        sample_format: hound::SampleFormat::Float,
        sample_rate: frequency,
        channels: 1,
        bits_per_sample: 32,
    };

    let mut writer = hound::WavWriter::create(path, spec).unwrap();
    for sample in samples {
        writer.write_sample(*sample).unwrap();
    }

    writer.finalize().unwrap();
}
