import { Tables } from "@/lib/supabase/database.types";
import GradientContainer from "../common/GradientContainer";


export default function PlaygroundDisplay({ playground }: { playground: Tables<'playgrounds'> }) {
    return (
        <GradientContainer direction="col" z="-20" className="p-8 w-80 items-center">
            <p className="font-extrabold">{playground.display_title}</p>
            <p>Author: {playground.author}</p>
            <p>Version: {playground.version}</p>
            {playground.description ? <p className="pt-4">Description: {playground.description}</p> : <></>}
        </GradientContainer>
    );
}