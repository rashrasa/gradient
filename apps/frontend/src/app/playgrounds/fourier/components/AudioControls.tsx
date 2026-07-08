"use client"

import GradientContainer from "@/app/components/common/GradientContainer";

export default function AudioControls({ playPause, stop, label }: { playPause: VoidFunction, stop: VoidFunction, label: string }) {
    return (
        <GradientContainer
            direction="col"
            className="mb-4"
        >
            <p className="font-semibold text-md">{label}</p>
            <GradientContainer
                direction="row"
                className="space-x-8"
            >
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg flex-1"
                    onClick={
                        (_) => {
                            playPause();
                        }
                    }
                >Play/Pause</button>
                <button
                    className="hover:cursor-pointer border border-sky-600 bg-white p-2 rounded-lg flex-1"
                    onClick={
                        (_) => {
                            stop();
                        }
                    }
                >Stop</button>
            </GradientContainer>
        </GradientContainer>
    );
}