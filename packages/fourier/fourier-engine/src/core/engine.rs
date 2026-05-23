use anyhow::Context;
use symphonia::core::{
    formats::{TrackType, probe::Hint},
    io::{MediaSourceStream, ReadOnlySource},
};

use crate::core::{DigitalSignal, FFTResult};

enum State {
    Ready,
    SignalLoaded(DigitalSignal, FFTResult),
}

struct Configuration {}

impl Default for Configuration {
    fn default() -> Self {
        Self {}
    }
}

// store
//  original audio
//  decomposition (fourier transform)
//  playback info (audio cursors)
//  inputs (set-point for number of summed waves)
//  reconstructed audio from inputs and setpoint
pub struct FourierEngine {
    state: State,
    configuration: Configuration,
}

impl FourierEngine {
    pub fn new() -> Self {
        FourierEngine {
            state: State::Ready,
            configuration: Default::default(),
        }
    }

    pub fn load_audio_data(&mut self, data: &[u8]) -> anyhow::Result<()> {
        let src = ReadOnlySource::new(data);
        let mss = MediaSourceStream::new(Box::new(src), Default::default());

        let mut format = symphonia::default::get_probe()
            .probe(&Hint::new(), mss, Default::default(), Default::default())
            .context("Failed to load audio data")?;

        let track = format
            .default_track(TrackType::Audio)
            .context("Could not find an audio track")?;

        let mut decoder = symphonia::default::get_codecs()
            .make_audio_decoder(
                track
                    .codec_params
                    .as_ref()
                    .context("Codec parameters missing")?
                    .audio()
                    .context("Audio format not supported")?,
                &Default::default(),
            )
            .context("Failed to create decoder")?;

        let frequency = decoder
            .codec_params()
            .sample_rate
            .context("Failed to read sampling rate of track")?;

        let track_id = track.id;

        let mut samples: Vec<f32> = vec![];

        loop {
            let packet = match format
                .next_packet()
                .context("Failed to read audio stream")?
            {
                Some(packet) => packet,
                None => break,
            };

            while !format.metadata().is_latest() {
                format.metadata().pop();
            }
            if packet.track_id != track_id {
                continue;
            }
            let decoded = decoder.decode(&packet).context("Failed to decode packet")?;
            decoded.copy_to_vec_interleaved(&mut samples);
        }

        let signal = DigitalSignal::new(frequency, samples);
        let fft_result = FFTResult::from_signal(signal.samples());

        self.state = State::SignalLoaded(signal, fft_result);
        Ok(())
    }
}
