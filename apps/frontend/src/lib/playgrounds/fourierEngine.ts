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
import WaveSurfer from 'wavesurfer.js';

export { ReadableState };

export type FourierEngineRendererState = {
    inner: ReadableState.Ready,
} | {
    inner: ReadableState.SignalLoaded,

    decodedSignal: DigitalSignal,
    additional: SignalLoadedAdditional,

    sortedFData: FFTValue[],
    fData: FFTValue[],
}

export class FourierEngineRenderer {
    private audioCtx: AudioContext | undefined;
    private state: FourierEngineRendererState;

    private originalBuffer: AudioBuffer | undefined;

    private outNode: AudioBufferSourceNode | undefined;

    private wsContainer: string | HTMLElement;
    private ws: WaveSurfer | undefined;

    constructor(wsContainer: string | HTMLElement) {
        this.wsContainer = wsContainer;
        this.state = { inner: ReadableState.Ready }
    }

    public async setAudioClip(file: File) {
        unload()
        this.audioCtx = new AudioContext();
        load_audio_data(new Uint8Array(await file.arrayBuffer()));
        let sortedFData = get_sorted_fft_result()!;
        let decodedSignal = get_signal()!;
        let additional = get_signal_additional()!;
        let fData = get_fft_result()!;

        let samples = decodedSignal.samples();

        this.originalBuffer = this.createBufferMono(samples as Float32Array<ArrayBuffer>, decodedSignal.frequency);

        this.ws = WaveSurfer.create({
            container: this.wsContainer,
            width: "100%",
            height: 600,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: URL.createObjectURL(file),
        });
        this.ws.on("interaction", () => this.ws!.play());

        this.state = {
            inner: ReadableState.SignalLoaded,
            sortedFData: sortedFData,
            decodedSignal: decodedSignal,
            additional: additional,
            fData: fData,
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
    public playOriginal() {
        if (this.state.inner == ReadableState.SignalLoaded) {
            this.ws!.play(0)
        }
    }

    public stop() {
        this.ws?.stop()
    }

    public getState(): FourierEngineRendererState {
        return this.state
    }

    public unloadAudioClip() {
        unload()
        this.ws!.destroy();
        this.ws = undefined;
        this.state = { inner: ReadableState.Ready };
    }

    public dispose() {
        this.state = { inner: ReadableState.Ready };
    }

    private playBuffer(buffer: AudioBuffer) {
        this.outNode?.stop();
        this.outNode = this.audioCtx!.createBufferSource();
        this.outNode.connect(this.audioCtx!.destination)
        this.outNode.buffer = buffer;
        this.outNode.start();
    }

    private createBufferMono(data: Float32Array<ArrayBuffer>, sampleRate: number): AudioBuffer {
        const buffer = this.audioCtx!.createBuffer(1, data.length, sampleRate);
        buffer.copyToChannel(data, 0);
        return buffer;
    }
}