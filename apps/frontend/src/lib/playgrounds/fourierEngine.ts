import {
    unload,
    get_wav_original,
    load_audio_data,
    ReadableState,
} from 'fourier-engine'
import WaveSurfer from 'wavesurfer.js';

export { ReadableState };

export type FourierEngineRendererState = {
    inner: ReadableState.Ready,
} | {
    inner: ReadableState.SignalLoaded,
}

export class FourierEngineRenderer {
    private state: FourierEngineRendererState;

    private wsContainer: string | HTMLElement;
    private ws: WaveSurfer | undefined;

    constructor(wsContainer: string | HTMLElement) {
        this.wsContainer = wsContainer;
        this.state = { inner: ReadableState.Ready }
    }

    public async setAudioClip(file: File) {
        this.unloadAudioClip()
        load_audio_data(new Uint8Array(await file.arrayBuffer()));
        const original = get_wav_original()! as Uint8Array<ArrayBuffer>;

        const blob: Blob = new Blob([original], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        this.ws = WaveSurfer.create({
            container: this.wsContainer,
            width: "100%",
            height: 200,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: url,
        });
        this.ws.on("interaction", () => this.ws!.play());

        this.state = {
            inner: ReadableState.SignalLoaded,
        };

    }

    public getState(): FourierEngineRendererState {
        return this.state
    }

    public playOriginal() {
        if (this.state.inner == ReadableState.SignalLoaded) {
            this.ws!.play(0)
        }
    }

    public stop() {
        this.ws?.stop()
    }

    public unloadAudioClip() {
        unload()
        this.ws?.destroy();
        this.ws = undefined;
        this.state = { inner: ReadableState.Ready };
    }

    public dispose() {
        this.state = { inner: ReadableState.Ready };
    }

}