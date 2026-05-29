import {
    unload,
    get_state,
    load_audio_data,
    ReadableState,
    get_sorted_fft_result,
    FFTValue,
    get_signal,
    get_fft_result,
    DigitalSignal,
    SignalLoadedAdditional,
    get_signal_additional
} from 'fourier-engine'

export { ReadableState };

export type FourierEngineRendererState = {
    inner: ReadableState.Ready,
} | {
    inner: ReadableState.SignalLoaded,

    decodedSignal: DigitalSignal,
    additional: SignalLoadedAdditional,

    sortedFData: FFTValue[],
    fData: FFTValue[],

    originalAudioBuffer: AudioBufferSourceNode,
}

export class FourierEngineRenderer {
    private audioCtx: AudioContext | undefined;

    private state: FourierEngineRendererState;

    constructor() {
        this.state = { inner: ReadableState.Ready }
        this.resolveState();
    }

    public setAudioClip(data: Uint8Array) {
        unload()
        this.audioCtx = new AudioContext();
        load_audio_data(data);
        this.resolveState();
    }

    public getSortedSignal(): FFTValue[] {
        switch (this.state.inner) {
            case ReadableState.Ready:
                throw Error("Cannot load signal. No audio file loaded.")
            case ReadableState.SignalLoaded:
                return this.state.sortedFData!
        }
    }

    private resolveState() {
        switch (get_state()) {
            case ReadableState.Ready:
                this.state = { inner: ReadableState.Ready }
                break;
            case ReadableState.SignalLoaded:
                this.audioCtx = new AudioContext();
                let sortedFData = get_sorted_fft_result()!;
                let decodedSignal = get_signal()!;
                let additional = get_signal_additional()!;
                let fData = get_fft_result()!;
                let originalAudioBuffer = new AudioBuffer({
                    length: decodedSignal.samples().length,
                    sampleRate: decodedSignal.frequency,
                    numberOfChannels: 1,
                });

                let sampleBuffer = new Float32Array(new ArrayBuffer(4 * decodedSignal.samples().length))
                sampleBuffer.set(decodedSignal.samples().map(s => s.y), 0)

                originalAudioBuffer.copyToChannel(sampleBuffer, 0);

                let originalBufferSource = this.audioCtx!.createBufferSource()
                originalBufferSource.buffer = originalAudioBuffer;
                originalBufferSource.connect(this.audioCtx!.destination);
                originalBufferSource.start();
                this.audioCtx!.resume()


                this.state = {
                    inner: ReadableState.SignalLoaded,
                    sortedFData: sortedFData,
                    decodedSignal: decodedSignal,
                    additional: additional,
                    fData: fData,
                    originalAudioBuffer: originalBufferSource,
                };
                break;

        }
    }

    public playOriginal() {
        if (this.state.inner == ReadableState.SignalLoaded) {
            if (this.audioCtx!.state == "suspended") {
                this.audioCtx!.resume()
            }
        }

    }

    public getState(): FourierEngineRendererState {
        return this.state
    }

    public unloadAudioClip() {
        unload()
        this.resolveState();
    }

    public dispose() {
        this.resolveState();
    }
}