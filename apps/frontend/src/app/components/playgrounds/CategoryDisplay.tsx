"use server"

import { Tables } from "@/lib/supabase/database.types";
import GradientContainer from "../common/GradientContainer";
import { fetchPlaygrounds } from "@/app/actions";
import PlaygroundDisplay from "./PlaygroundDisplay";


export default async function CategoryDisplay({ category }: { category: Tables<'categories'> }) {
    const { data, error } = await fetchPlaygrounds(category.category_number);

    return (
        <GradientContainer key={category.category_number} direction="col" z="-30" className="p-12 mx-8 my-4">
            <p className="font-extrabold text-6xl">{category.display_title}</p>
            {category.description ? <p>{category.description}</p> : <></>}

            <GradientContainer className="pt-4 space-x-4 items-stretch justify-start" z="-30" direction="row">
                {error != undefined ? <p>Failed to fetch playgrounds</p> : data.map(
                    (playground) => <PlaygroundDisplay key={playground.playground_number} playground={playground} />
                )}
            </GradientContainer>
        </GradientContainer>
    );
}