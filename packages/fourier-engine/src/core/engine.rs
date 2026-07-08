use std::io::Cursor;

use crate::{
    StartListSelection,
    core::{ComplexFloat, DigitalSignal, FFTResult},
};
use anyhow::Context;
use symphonia::core::{
    formats::{TrackType, probe::Hint},
    io::{MediaSourceStream, ReadOnlySource},
};

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

    pub partial_playable: Vec<PlayablePartial>,
}

#[derive(Debug, Clone)]
pub struct PlayablePartial {
    pub freqs: Vec<f32>,
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

        let original_signal = DigitalSignal::new(frequency, samples);
        let original_fft = FFTResult::from_signal(&original_signal);

        let original_wav = samples_to_wav_bytes(
            original_signal.samples().to_vec(),
            original_signal.frequency(),
            1,
        )?;

        let mut partial_playable = vec![];
        let fft_len = original_fft.len();
        for (i, f) in crate::GENERATE_TOP_F.iter().enumerate() {
            let n = match f {
                StartListSelection::Indexes(n) => *n,
                StartListSelection::Proportion(f) => (fft_len as f64 * f) as usize,
            };
            let n = n.min(fft_len);

            let mut partial_fft: Vec<ComplexFloat> =
                (0..fft_len).map(|_| ComplexFloat::ZERO).collect();
            let mut frequencies_partial = Vec::with_capacity(n);

            let mut items = 0;
            for (index_to_find, x) in original_fft.sorted_values().take(n).enumerate() {
                // we must search the entire original index container for i
                // to get the original bin number

                let mut original_index = None;
                for (position, index_to_match) in original_fft.sorted_original_indices().enumerate()
                {
                    if *index_to_match == index_to_find {
                        original_index = Some(position);
                        break;
                    }
                }
                let original_index = original_index.unwrap();

                partial_fft[original_index] = x.result();
                frequencies_partial.push(x.frequency());
                items += 1;
            }
            assert!(items == n, "expected {n} items, got {items}");

            let partial_signal = DigitalSignal::from_fft(
                &partial_fft,
                original_signal.frequency(),
                original_signal.samples().len(),
            );
            let wav = samples_to_wav_bytes(
                partial_signal.samples().to_vec(),
                partial_signal.frequency(),
                1,
            )?;

            partial_playable.push(PlayablePartial {
                freqs: frequencies_partial,
                wav,
            });
        }

        let playable = Playable {
            original_wav,
            partial_playable,
        };

        self.state = State::SignalLoaded(SignalLoaded {
            signal: original_signal,
            fft: original_fft,
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
