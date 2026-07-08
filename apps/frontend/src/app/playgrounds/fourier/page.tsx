"use client"

import GradientContainer from "@/app/components/common/GradientContainer"
import { useEffect, useRef, useState } from "react";
import { FourierEngineRenderer, FourierEngineRendererState } from "@/lib/playgrounds/fourierEngine";
import { ReadableState } from "fourier-engine";
import { record } from "@/lib/debug/profile";
import AudioControls from "./components/AudioControls";

let renderer: FourierEngineRenderer | undefined;

export default function FourierPlayground() {
    let waveformRef = useRef<HTMLDivElement>(null);
    let finishPageCompute = record("Computing page")
    useEffect(() => {
        renderer = new FourierEngineRenderer(waveformRef.current!);
        return () => {
            renderer?.dispose()
        }
    }, [])
    const uploadAudioRef = useRef<HTMLInputElement>(null);
    const [loadedFile, setLoadedFile] = useState<string | null>(null);
    const [rendererState, setRendererState] = useState<FourierEngineRendererState>({ inner: ReadableState.Ready });

    finishPageCompute();
    return (
        <GradientContainer
            className="items-center py-12 space-x-8 p-4"
            direction="row"
        >
            <GradientContainer
                ref={waveformRef}
                id="waveform"
                className="flex flex-30 border-4 min-h-160 border-black rounded-4xl bg-white space-y-8 py-8"
            >
            </GradientContainer>
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
                    onChange={async (v) => {
                        let stop = record("Audio file upload and processing");
                        const file = v.target.files?.item(0);
                        if (file == null || file == undefined) {
                            console.log("No file found")
                            return;
                        }
                        await renderer!.setAudioClip(file)
                        setLoadedFile(file.name);
                        setRendererState(renderer!.getState());
                        stop()
                    }}
                    className="hidden"
                />
                {(rendererState.inner == ReadableState.SignalLoaded) ?
                    (<>
                        <button
                            className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg mb-4"
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
                        <AudioControls
                            playPause={() => renderer!.playPauseOriginal()}
                            stop={() => renderer!.stopOriginal()}
                            label={"Original"}
                        />
                        {renderer!.partialSignals()!.map((sig, i) =>
                            <AudioControls
                                key={i}
                                playPause={() => sig.playPause()}
                                stop={() => sig.stop()}
                                label={`Top ${sig.frequencies.length} frequencies`}
                            />
                        )}
                    </>)
                    : <></>}

            </GradientContainer>
        </GradientContainer>
    )
}

