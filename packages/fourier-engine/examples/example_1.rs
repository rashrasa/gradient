use fourier_engine::core::FourierEngine;

fn main() {
    let mut engine = FourierEngine::new();
    engine
        .load_audio_data(include_bytes!("assets/sample.mp3"))
        .unwrap();

    println!(
        "Result: Length: {}",
        engine.fft_result().unwrap().unsorted_values().len()
    );

    let audio_spec = hound::WavSpec {
        channels: 1,
        sample_rate: engine.fft_result().unwrap().original_frequency() as u32,
        bits_per_sample: 32,
        sample_format: hound::SampleFormat::Float,
    };

    std::fs::create_dir_all("packages/fourier-engine/examples/generated").unwrap();
    let mut writer = hound::WavWriter::create(
        "packages/fourier-engine/examples/generated/sample.wav",
        audio_spec,
    )
    .unwrap();
    println!(
        "Reconstructed Sample Count: {:?}",
        engine.fft_result().unwrap().reconstructed().len()
    );
    for sample in engine.fft_result().unwrap().reconstructed().iter() {
        writer.write_sample(*sample).unwrap();
    }
}
