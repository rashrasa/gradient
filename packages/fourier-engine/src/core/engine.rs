use anyhow::Context;
use symphonia::core::{
    formats::{TrackType, probe::Hint},
    io::{MediaSourceStream, ReadOnlySource},
};

use crate::core::{DigitalSignal, FFTResult, Point2F};

#[derive(Debug, Clone, Copy)]
pub struct SignalLoadedAdditional {
    pub original_signal_domain: [f32; 2],
    pub original_signal_range: [f32; 2],
}

#[derive(Debug, Clone)]
pub enum State {
    Ready,
    SignalLoaded(DigitalSignal, FFTResult, SignalLoadedAdditional),
}

impl Default for State {
    fn default() -> Self {
        Self::Ready
    }
}

#[derive(Debug)]
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

    pub fn signal(&self) -> Option<&DigitalSignal> {
        if let State::SignalLoaded(s, ..) = &self.state {
            return Some(s);
        }
        None
    }

    pub fn signal_additional(&self) -> Option<&SignalLoadedAdditional> {
        if let State::SignalLoaded(.., a) = &self.state {
            return Some(a);
        }
        None
    }

    pub fn fft_result(&self) -> Option<&FFTResult> {
        match &self.state {
            State::Ready => None,
            State::SignalLoaded(_, result, ..) => Some(result),
        }
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

        let mut t_min = f32::MAX;
        let mut t_max = f32::MIN;
        let mut y_min = f32::MAX;
        let mut y_max = f32::MIN;

        for (i, s) in samples.iter().enumerate() {
            let t = i as f32 / frequency as f32;
            let y = *s;
            t_min = t_min.min(t);
            t_max = t_max.max(t);
            y_min = y_min.min(y);
            y_max = y_max.max(y);
        }

        let signal = DigitalSignal::new(frequency as f32, samples);
        let fft_result = FFTResult::from_signal(&signal);

        self.state = State::SignalLoaded(
            signal,
            fft_result,
            SignalLoadedAdditional {
                original_signal_domain: [t_min, t_max],
                original_signal_range: [y_min, y_max],
            },
        );
        Ok(())
    }
}
