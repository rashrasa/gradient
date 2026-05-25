"use server"

import GradientContainer from "../common/GradientContainer";
import PlaygroundDisplay from "./PlaygroundDisplay";
import { Category, Playground, PLAYGROUNDS } from "@/lib/playgrounds/playground";


export default async function CategoryDisplay({ number }: { number: Category }) {
    const category = PLAYGROUNDS.categories[number];

    return (
        <GradientContainer key={number} direction="col" z="-30" className="p-12 mx-8 my-4">
            <p className="font-extrabold text-6xl">{category.title}</p>
            {category.description ? <p>{category.description}</p> : <></>}

            <GradientContainer className="pt-4 space-x-4 items-stretch justify-start" z="-30" direction="row">
                {Object.entries(PLAYGROUNDS.playgrounds).map(
                    ([number, playground]) => <PlaygroundDisplay key={number} number={number as Playground} />
                )}
            </GradientContainer>
        </GradientContainer>
    );
}