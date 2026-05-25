"use client"

import GradientContainer from "@/app/components/common/GradientContainer"
import { useEffect, useRef, useState } from "react";
import { FourierEngineRenderer } from "@/lib/playgrounds/fourierEngine";

const CANVAS_ID = "fourier_engine_canvas"

export default function FourierPlayground() {
    const [size, setSize] = useState({ width: 300, height: 300 });
    const uploadAudioRef = useRef<HTMLInputElement>(null);

    let renderer: FourierEngineRenderer;
    useEffect(() => {
        renderer = new FourierEngineRenderer(CANVAS_ID);
        return () => { }
    })
    return (
        <GradientContainer className="items-center py-12">
            <canvas
                className="hover:cursor-pointer bg-white"
                height={size.height}
                width={size.width}
                id={CANVAS_ID}
                onClick={(_) => {
                    setSize({ width: size.width + 20, height: size.height + 20 })
                    renderer.notifyResize()
                }}
            />
            <GradientContainer className="mt-4 space-y-2">
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                    onClick={(_) => uploadAudioRef.current?.click()}
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
                        file.arrayBuffer().then(buf => renderer.setAudioClip(new Uint8Array(buf)))

                    }}
                    className="hidden"
                />
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg"
                    onClick={(_) => renderer.unloadAudioClip()}
                >Clear Audio</button>
            </GradientContainer>
        </GradientContainer>
    )
}