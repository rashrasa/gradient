import { unload, get_state, load_audio_data, ReadableState, get_sorted_fft_result } from 'fourier-engine'

export class FourierEngineRenderer {
    private canvas: HTMLCanvasElement;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement | undefined;
        if (!canvas) {
            throw Error("Invalid canvas id");
        }

        this.canvas = canvas;
        this.notifyResize()
    }

    public notifyResize() {
        this.render()
    }

    private render() {
        const ctx = this.canvas.getContext("2d")!;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.clearRect(0, 0, width, height);


        ctx.fillStyle = "red"
        ctx.font = 'bold 18px monospace'
        ctx.font
        ctx.fillText(`WASM Module Status:`, width / 2 - 80, height * 0.2)

        switch (get_state()) {
            case ReadableState.Ready:
                ctx.fillText("Ready", width / 2 - 30, height * 0.2 + 30)
                break;
            case ReadableState.SignalLoaded:
                ctx.fillText("Signal Loaded", width / 2 - 60, height * 0.2 + 30)
                ctx.font = '12px monospace'
                ctx.fillText(`Extracted ${get_sorted_fft_result()!.length} frequencies`, width / 2 - 80, height * 0.2 + 50)
                let results = get_sorted_fft_result()!;
                ctx.font = '12px monospace'
                ctx.fillText(`Highest Amp Results`, width / 2 - 120, height * 0.2 + 70)

                ctx.fillText(`Freq: ${results[0].frequency}`, width / 2 - 120, height * 0.2 + 100)
                ctx.fillText(`Phase ${results[0].phase}`, width / 2 - 120, height * 0.2 + 112)
                ctx.fillText(`Amplitude ${results[0].amplitude}`, width / 2 - 120, height * 0.2 + 124)

                ctx.fillText(`Freq: ${results[1].frequency}`, width / 2 - 120, height * 0.2 + 148)
                ctx.fillText(`Phase ${results[1].phase}`, width / 2 - 120, height * 0.2 + 160)
                ctx.fillText(`Amplitude ${results[1].amplitude}`, width / 2 - 120, height * 0.2 + 172)

                ctx.fillText(`Freq: ${results[2].frequency}`, width / 2 - 120, height * 0.2 + 196)
                ctx.fillText(`Phase ${results[2].phase}`, width / 2 - 120, height * 0.2 + 208)
                ctx.fillText(`Amplitude ${results[2].amplitude}`, width / 2 - 120, height * 0.2 + 220)
                break;
        }
        ctx.fill()
    }

    public setAudioClip(data: Uint8Array) {
        try {
            load_audio_data(data);
        } catch (e) {
            console.error(e)
        }
        this.render()
    }

    public unloadAudioClip() {
        unload()
        this.render()
    }
}