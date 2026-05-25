use fourier_engine::core::FourierEngine;

fn main() {
    let mut engine = FourierEngine::new();
    engine
        .load_audio_data(include_bytes!("assets/sample.mp3"))
        .unwrap();

    println!("{:?}", engine.fft_result().unwrap())
}
