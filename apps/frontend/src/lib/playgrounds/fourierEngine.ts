import {
    unload,
    get_wav_original,
    load_audio_data,
    ReadableState,
    get_wavs_partial,
} from 'fourier-engine'
import WaveSurfer from 'wavesurfer.js';

export { ReadableState };

export type FourierEngineRendererState = Ready | SignalLoaded;

type Ready = { inner: ReadableState.Ready, }
type SignalLoaded = {
    inner: ReadableState.SignalLoaded,
    ws_original: WaveSurfer,
    ws_partials: PartialSignal[],
}

export class FourierEngineRenderer {
    private state: FourierEngineRendererState;
    private wsContainer: string | HTMLElement;

    constructor(wsContainer: string | HTMLElement) {
        this.wsContainer = wsContainer;
        this.state = { inner: ReadableState.Ready }
    }

    public async setAudioClip(file: File): Promise<SignalLoaded> {
        this.unloadAudioClip()
        load_audio_data(new Uint8Array(await file.arrayBuffer()));
        const ws = waveSurferFromBytes(this.wsContainer, get_wav_original()! as Uint8Array<ArrayBuffer>)

        const partials = get_wavs_partial()!;
        const ws_partials = partials.map((v) => new PartialSignal(
            waveSurferFromBytes(this.wsContainer, v.wav() as Uint8Array<ArrayBuffer>), Array.from(v.freqs())
        ));
        this.state = {
            inner: ReadableState.SignalLoaded,
            ws_original: ws,
            ws_partials: ws_partials
        };

        return this.state;
    }

    public getState(): FourierEngineRendererState {
        return this.state
    }

    public playPauseOriginal() {
        let state = unwrapSignal(this.state);
        state?.ws_original.playPause();

    }
    public stopOriginal() {
        let state = unwrapSignal(this.state);
        state?.ws_original.stop();
    }

    public partialSignals(): PartialSignal[] | undefined {
        let state = unwrapSignal(this.state);
        return state?.ws_partials;
    }

    public unloadAudioClip() {
        if (this.state.inner == ReadableState.SignalLoaded) {
            this.state.ws_original.destroy();
            for (const p of this.state.ws_partials) {
                p.ws.destroy();
            }
            unload()
            this.state = { inner: ReadableState.Ready };
        }

    }

    public dispose() {
        this.unloadAudioClip();
    }
}

export class PartialSignal {
    public frequencies: number[];
    public ws: WaveSurfer;
    constructor(ws: WaveSurfer, frequencies: number[]) {
        this.ws = ws;
        this.frequencies = frequencies.sort();
    }

    public playPause() {
        this.ws.playPause();
    }
    public stop() {
        this.ws.stop();
    }
}

function waveSurferFromBytes(container: string | HTMLElement, bytes: Uint8Array<ArrayBuffer>): WaveSurfer {
    const original = bytes as Uint8Array<ArrayBuffer>;
    const blob: Blob = new Blob([original], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const ws = WaveSurfer.create({
        container: container,
        width: "100%",
        height: 200,
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        url: url,
    });
    ws.on("interaction", () => ws!.play());
    return ws;
}


function unwrapOrWarn(state: FourierEngineRendererState, expected: ReadableState.Ready): Ready | undefined;
function unwrapOrWarn(state: FourierEngineRendererState, expected: ReadableState.SignalLoaded): SignalLoaded | undefined;
function unwrapOrWarn(state: FourierEngineRendererState, expected: ReadableState) {
    if (state.inner == expected) {
        return state;
    }
    else {
        let expectedStr;
        switch (expected) {
            case ReadableState.Ready:
                expectedStr = "Ready"
                break;
            case ReadableState.SignalLoaded:
                expectedStr = "SignalLoaded"
                break;
        }
        console.warn(`Renderer not in ${expectedStr} state`);
    }
}
function unwrapSignal(state: FourierEngineRendererState): SignalLoaded | undefined {
    return unwrapOrWarn(state, ReadableState.SignalLoaded);
}