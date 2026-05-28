"use client"

import GradientContainer from "@/app/components/common/GradientContainer"
import { useEffect, useRef, useState } from "react";
import { FourierEngineRenderer, FourierEngineRendererState } from "@/lib/playgrounds/fourierEngine";
import { Coordinates, Mafs, Plot, Point } from "mafs";
import { FFTValue, ReadableState } from "fourier-engine";

let renderer: FourierEngineRenderer | undefined;

export default function FourierPlayground() {
    useEffect(() => {
        renderer = new FourierEngineRenderer();
        return () => { renderer?.dispose() }
    }, [])

    const uploadAudioRef = useRef<HTMLInputElement>(null);
    const [loadedFile, setLoadedFile] = useState<string | null>(null);
    const [height, setHeight] = useState(600);
    const [rendererState, setRendererState] = useState<FourierEngineRendererState>({ inner: ReadableState.Ready });
    const onResize = () => setHeight(window.innerHeight * 0.8)

    useEffect(() => {
        onResize()
        window.addEventListener("resize", (_) => { onResize() });
        return () => { window.removeEventListener("resize", (_) => { onResize() }) }
    })

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
                graph1 = createFunctionGraph({
                    f: (x) => {
                        let sample = fSignal.map(fft => fftToFunction(fft)(x)).reduce((a, b) => a + b)

                        return sample
                    },
                    start: [
                        0.0,
                        fSignal.map(a => a.amplitude).reduce((a, b) => Math.min(a, b)),
                    ],
                    size: [
                        100.0,
                        fSignal.map(a => a.amplitude).reduce((a, b) => Math.max(a, b)),
                    ],
                });
                graph2 = createSampledGraph({
                    samples: [...rendererState.decodedSignal.amplitudes()].map(
                        (y, i) => { return { x: i * 1.0 / rendererState.decodedSignal.frequency, y: y } }
                    )
                })
                break;
        }
    }


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
                {[
                    graph1 ?? defaultGraph({ sampled: false }),
                    graph2 ?? defaultGraph({ sampled: false }),
                    graph3 ?? defaultGraph({ sampled: true }),
                ].map((g, i) => (<GradientContainer key={i} border="" z="none" className="border border-black">
                    <Mafs
                        width={"auto"}
                        height={height / 3}
                        viewBox={{ x: g.domain, y: g.range, padding: 0.0 }}
                        preserveAspectRatio={false}
                        pan={false}
                    >
                        <Coordinates.Cartesian
                            xAxis={{ lines: Math.round((g.domain[1] - g.domain[0]) / g.nSplits[0]) }}
                            yAxis={{ lines: Math.round((g.range[1] - g.range[0]) / g.nSplits[1]) }}
                        />
                        {
                            (g.func.sampled) ?
                                (g.func.points.map((p, i) => <Point key={i} x={p.x} y={p.y} svgCircleProps={{ r: 2 }} />)) :
                                <Plot.OfX y={g.func.f} />
                        }

                    </Mafs>
                </GradientContainer>)
                )}
            </GradientContainer >
            <GradientContainer
                className="flex-5 mt-4 space-y-2 "
                z="none"
            >
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                    onClick={(_) => uploadAudioRef.current!.click()}
                >Upload Audio</button>
                <input
                    ref={uploadAudioRef}
                    type="file"
                    onChange={(v) => {
                        const file = v.target.files?.item(0);
                        if (file == null || file == undefined) {
                            console.log("No file found")
                            return;
                        }
                        file.arrayBuffer().then(buf => {
                            renderer!.setAudioClip(new Uint8Array(buf))
                            setLoadedFile(file.name);
                            setRendererState(renderer!.getState());
                        })

                    }}
                    className="hidden"
                />
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                    onClick={
                        (_) => {
                            renderer!.unloadAudioClip();
                            setRendererState(renderer!.getState());
                        }
                    }
                >Clear Audio</button>
            </GradientContainer>
        </GradientContainer>
    )
}

type Function = {
    sampled: true, points: { x: number, y: number }[]
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
}: {
    samples: { x: number, y: number }[],
}): Graph {
    let minX = Math.min(...samples.map(s => s.x));
    let maxX = Math.max(...samples.map(s => s.x));
    let minY = Math.min(...samples.map(s => s.y));
    let maxY = Math.max(...samples.map(s => s.y));
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
            samples: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => { return { x: x, y: 10 * Math.random() } })
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
