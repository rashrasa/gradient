"use client"

import GradientContainer from "@/app/components/common/GradientContainer"
import { useEffect, useRef, useState } from "react";
import { FourierEngineRenderer, FourierEngineRendererState } from "@/lib/playgrounds/fourierEngine";
import { DigitalSignal, FFTValue, ReadableState, Point2F, SignalLoadedAdditional } from "fourier-engine";
import { record } from "@/lib/debug/profile";

import { Line, Scatter } from "react-chartjs-2";
import { Chart, LinearScale, TimeScale, PointElement, Point } from "chart.js";

let renderer: FourierEngineRenderer | undefined;

Chart.register(LinearScale, PointElement, TimeScale);

export default function FourierPlayground() {
    let stop = record("Computing page")
    useEffect(() => {
        renderer = new FourierEngineRenderer();
        window.addEventListener("resize", (_) => { onResize() });
        return () => {
            renderer?.dispose()
            window.removeEventListener("resize", (_) => { onResize() })
        }
    }, [])
    const uploadAudioRef = useRef<HTMLInputElement>(null);
    const [loadedFile, setLoadedFile] = useState<string | null>(null);
    const [height, setHeight] = useState(600);
    const [rendererState, setRendererState] = useState<FourierEngineRendererState>({ inner: ReadableState.Ready });
    const onResize = () => setHeight(window.innerHeight * 0.8)

    let graph1: Graph | undefined;
    let graph2: Graph | undefined;
    let graph3: Graph | undefined;

    if (renderer) {
        switch (rendererState.inner) {
            case ReadableState.Ready:
                break;
            case ReadableState.SignalLoaded:
                const N = 100;
                const fSignal = rendererState.fData;
                let samples = rendererState.decodedSignal.samples()
                graph1 = createSampledGraph({
                    samples: samples,
                    additional: rendererState.additional,
                });
                console.log(samples)
                break;
        }
    }

    const graphNodes = [
        graph1 ?? defaultGraph({ sampled: true }),
    ].map((g, i) => (<GradientContainer key={i} border="" z="none" className="border border-black">
        {(g.func.sampled) ?
            <Scatter
                height={height / 3}
                key={i}
                data={{
                    datasets: [{
                        data: g.func.points,
                        backgroundColor: "black",
                        pointRadius: 4
                    }]
                }}
                options={{
                    scales: {
                        x: {
                            type: "linear",
                            position: "bottom",
                            min: g.domain[0],
                            max: g.domain[1]
                        },
                        y: {
                            type: "linear",
                            position: "bottom",
                            min: g.range[0],
                            max: g.range[1]
                        }
                    }
                }}
            /> : <></>
        }

    </GradientContainer>)
    );
    stop();
    return (
        <GradientContainer
            className="items-center py-12 space-x-8 p-4"
            direction="row"
        >
            <GradientContainer
                z="none"
                className="flex-30 bg-white space-y-4"
                style={{ height: height }}
            >
                {graphNodes}
            </GradientContainer >
            <GradientContainer
                className="flex-5 mt-4 space-y-2 "
                z="none"
            >
                {(loadedFile != null) ? <p>Loaded: {loadedFile}</p> : <></>}
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                    onClick={(_) => uploadAudioRef.current!.click()}
                >Upload Audio</button>
                <input
                    ref={uploadAudioRef}
                    type="file"
                    onChange={(v) => {
                        let stop = record("Audio file upload and processing");
                        const file = v.target.files?.item(0);
                        if (file == null || file == undefined) {
                            console.log("No file found")
                            return;
                        }
                        file.arrayBuffer().then(buf => {
                            renderer!.setAudioClip(new Uint8Array(buf))
                            setLoadedFile(file.name);
                            setRendererState(renderer!.getState());
                            stop()
                        })

                    }}
                    className="hidden"
                />
                {(rendererState.inner == ReadableState.SignalLoaded) ?
                    (
                        <><button
                            className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                            onClick={
                                (_) => {
                                    let stop = record("Unloading audio")
                                    renderer!.unloadAudioClip();
                                    setRendererState(renderer!.getState());
                                    setLoadedFile(null);
                                    stop()
                                }
                            }
                        >Clear Audio</button>
                            <button
                                className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                                onClick={
                                    (_) => {
                                        renderer!.playOriginal();
                                    }
                                }
                            >Play Original Audio</button></>)
                    : <></>}

            </GradientContainer>
        </GradientContainer>
    )
}

type Function = {
    sampled: true, points: Point[]
} | {
    sampled: false, f: (x: number) => number
};
interface Graph {
    readonly func: Function
    readonly start: [x: number, y: number]
    readonly size: [x: number, y: number]
    readonly nSplits: [x: number, y: number]
    readonly domain: [x: number, y: number]
    readonly range: [x: number, y: number]
}

function createSampledGraph({
    samples,
    additional
}: {
    samples: Point[],
    additional: SignalLoadedAdditional,
}): Graph {
    let minX = additional.original_signal_domain.t
    let maxX = additional.original_signal_domain.y
    let minY = additional.original_signal_range.t
    let maxY = additional.original_signal_range.y
    return createGraph({
        graphDesc: { sampled: true, points: samples },
        start: [minX, minY],
        size: [maxX - minX, maxY - minY],
    });
}

function createFunctionGraph({
    f, start, size
}: {
    f: (x: number) => number,
    start: [x: number, y: number],
    size: [x: number, y: number],
}) {
    return createGraph({
        graphDesc: { sampled: false, f: f },
        start: start,
        size: size
    });
}

function createGraph({
    graphDesc, start, size
}: {
    graphDesc: Function,
    start: [x: number, y: number],
    size: [x: number, y: number],
}): Graph {
    return {
        func: graphDesc,
        start: start,
        size: size,
        nSplits: [20, 10],
        domain: [start[0] - size[0] * 0.01, start[0] + size[0]],
        range: [start[1] - size[1] * 0.10, start[1] + size[1]]
    };
}

function defaultGraph({ sampled }: { sampled: boolean }): Graph {
    if (sampled) {
        return createSampledGraph({
            samples: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => { return { x: x, y: 10 * Math.random() } }),
            additional: new SignalLoadedAdditional(
                new Point2F(0, 10),
                new Point2F(0, 10),
            )
        })
    } else {
        return createFunctionGraph({
            f: (x) => 5.0 * Math.sin(x),
            start: [0, -5],
            size: [10, 10],
        })
    }

}

function fftToFunction(fft: FFTValue): (x: number) => number {
    return (x: number) => fft.amplitude * Math.sin(1.0 / fft.frequency * x + fft.phase);
}
