import { unload, get_state, load_audio_data, ReadableState, get_sorted_fft_result, FFTValue, get_signal, get_fft_result, DigitalSignal } from 'fourier-engine'

export { ReadableState };

export type FourierEngineRendererState = {
    inner: ReadableState.Ready,
} | {
    inner: ReadableState.SignalLoaded,

    uploadedAudio: Uint8Array,

    decodedSignal: DigitalSignal,

    sortedFData: FFTValue[],
    fData: FFTValue[],

}

export class FourierEngineRenderer {
    private audioCtx: AudioContext;
    private state: FourierEngineRendererState;

    constructor() {
        this.state = { inner: ReadableState.Ready };
        this.audioCtx = new AudioContext();
    }

    public setAudioClip(data: Uint8Array) {
        load_audio_data(data);
        this.state = {
            inner: ReadableState.SignalLoaded,
            uploadedAudio: data,
            sortedFData: get_sorted_fft_result()!,
            decodedSignal: get_signal()!,
            fData: get_fft_result()!,
        };
    }

    public getSortedSignal(): FFTValue[] {
        switch (this.state.inner) {
            case ReadableState.Ready:
                throw Error("Cannot load signal. No audio file loaded.")
            case ReadableState.SignalLoaded:
                return this.state.sortedFData!
        }
    }

    public getState(): FourierEngineRendererState {
        return this.state
    }

    public unloadAudioClip() {
        unload()
    }

    public dispose() { }
}