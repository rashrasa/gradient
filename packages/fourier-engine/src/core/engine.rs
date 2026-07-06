use std::io::Cursor;

use anyhow::Context;
use symphonia::core::{
    formats::{TrackType, probe::Hint},
    io::{MediaSourceStream, ReadOnlySource},
};

use crate::core::{DigitalSignal, FFTResult};

#[derive(Debug, Clone, Copy)]
pub struct SignalLoadedAdditional {
    pub original_signal_domain: [f32; 2],
    pub original_signal_range: [f32; 2],
}

#[derive(Debug, Clone, Default)]
pub enum State {
    #[default]
    Ready,
    SignalLoaded(SignalLoaded),
}

#[derive(Debug, Clone)]
pub struct SignalLoaded {
    pub signal: DigitalSignal,
    pub fft: FFTResult,

    pub playable: Playable,
}

#[derive(Debug, Clone)]
pub struct Playable {
    pub original_wav: Vec<u8>,

    pub partial_frequency_counts: Vec<PlayablePartial>,
}

#[derive(Debug, Clone)]
pub struct PlayablePartial {
    pub n_freqs: usize,
    pub wav: Vec<u8>,
}

#[derive(Debug, Default)]
struct Configuration {}

// store
//  original audio
//  decomposition (fourier transform)
//  playback info (audio cursors)
//  inputs (set-point for number of summed waves)
//  reconstructed audio from inputs and setpoint
#[derive(Default, Debug)]
pub struct FourierEngine {
    state: State,
    configuration: Configuration,
}

impl FourierEngine {
    pub fn new() -> Self {
        FourierEngine {
            ..Default::default()
        }
    }

    pub fn state(&self) -> &State {
        &self.state
    }

    pub fn try_loaded(&self) -> Option<&SignalLoaded> {
        if let State::SignalLoaded(loaded) = &self.state {
            return Some(loaded);
        }
        None
    }

    pub fn unload(&mut self) {
        self.state = State::Ready;
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

        println!("Track Frequency: {}", frequency);

        let track_id = track.id;
        let mut sample_sets: Vec<Vec<f32>> = vec![];
        loop {
            let mut decoded_sets: Vec<Vec<f32>> = vec![];
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

            decoded.copy_to_vecs_planar(&mut decoded_sets);
            while sample_sets.len() < decoded_sets.len() {
                sample_sets.push(vec![]);
            }

            for i in 0..decoded_sets.len() {
                sample_sets[i].extend(&decoded_sets[i]);
            }
        }

        let mut samples = vec![];

        let n_samples = sample_sets[0].len();
        let n_sets = sample_sets.len();
        println!("samples: {} sets: {}", n_samples, n_sets);
        for i in 0..n_samples {
            let mut sample = 0.0;
            for sample_set in sample_sets.iter() {
                sample += sample_set[i];
            }
            samples.push(sample / n_sets as f32);
        }

        let signal = DigitalSignal::new(frequency, samples);
        let fft = FFTResult::from_signal(&signal);

        let original_wav = samples_to_wav_bytes(signal.samples().to_vec(), signal.frequency(), 1)?;

        let playable = Playable {
            original_wav,
            partial_frequency_counts: vec![],
        };

        self.state = State::SignalLoaded(SignalLoaded {
            signal,
            fft,
            playable,
        });
        Ok(())
    }
}

fn samples_to_wav_bytes(
    samples: Vec<f32>,
    sample_rate: u32,
    channels: u16,
) -> anyhow::Result<Vec<u8>> {
    let original_spec = hound::WavSpec {
        channels,
        sample_rate,
        bits_per_sample: 32,
        sample_format: hound::SampleFormat::Float,
    };
    let mut writer = Cursor::new(Vec::<u8>::with_capacity(samples.len()));
    let mut original_wav = hound::WavWriter::new(&mut writer, original_spec)?;
    for sample in samples {
        original_wav.write_sample(sample)?;
    }
    original_wav.finalize()?;

    Ok(writer.into_inner())
}
