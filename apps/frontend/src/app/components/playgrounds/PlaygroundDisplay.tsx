"use client"

import { useRouter } from "next/navigation";
import GradientContainer from "../common/GradientContainer";
import { Playground, PLAYGROUNDS } from "@/lib/playgrounds/playground";


export default function PlaygroundDisplay({ number }: { number: Playground }) {
    const router = useRouter();
    const playground = PLAYGROUNDS.playgrounds[number];
    return (
        <GradientContainer
            direction="col"
            z="-20"
            className="p-8 w-80 items-center select-none box-border border-2 border-sky-300 hover:cursor-pointer hover:border-white"
            onClick={(_) => router.push(`playgrounds/${number.toLowerCase()}`)}
        >
            <p className="font-extrabold">{playground.title}</p>
            <p>Author: {playground.author}</p>
            <p>Version: {playground.version}</p>
            {playground.description ? <p className="pt-4">Description: {playground.description}</p> : <></>}
        </GradientContainer>
    );
}