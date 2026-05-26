use std::io::Write;

use anyhow::Context;
use fourier_engine::{
    FFTValue,
    core::{DigitalSignal, FFTResult, Function},
};

fn main() -> anyhow::Result<()> {
    let freq = 240.0;
    let period = 1.0 / freq;
    let dur = 360.0;

    let samples = Function::new(|x| (x * 3.0).sin() + (x * 2.0).cos()).sample(0.0, dur, freq);
    let signal = DigitalSignal::new(freq, samples);
    let fft: Vec<FFTValue> = FFTResult::from_signal(&signal)
        .sorted_values()
        .map(|v| *v)
        .collect();

    std::fs::create_dir_all("packages/fourier/fourier-engine/bin/fft-test/result").unwrap();

    let mut signal_file =
        std::fs::File::create("packages/fourier/fourier-engine/bin/fft-test/result/signal.tsv")
            .context("Failed to write file.")?;

    signal_file.write_all(b"time\tamplitude\n").unwrap();

    let mut fft_file =
        std::fs::File::create("packages/fourier/fourier-engine/bin/fft-test/result/fft.tsv")
            .context("Failed to write file.")?;
    fft_file.write_all(b"frequency\tamplitude\n").unwrap();

    for (i, ampl) in signal.samples().iter().enumerate() {
        signal_file
            .write_all(&format!("{}\t{}\n", i as f32 * period, ampl).into_bytes())
            .unwrap();
    }
    for f in fft.iter().take(fft.len() / 2) {
        fft_file
            .write_all(&format!("{}\t{}\n", f.frequency(), f.result().r()).into_bytes())
            .unwrap();
    }

    signal_file.flush().unwrap();
    fft_file.flush().unwrap();

    Ok(())
}
