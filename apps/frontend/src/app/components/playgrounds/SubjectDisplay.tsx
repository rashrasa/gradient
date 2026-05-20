"use server"

import { Tables } from "@/lib/supabase/database.types";
import GradientContainer from "../common/GradientContainer";
import { fetchCategories } from "@/app/actions";
import CategoryDisplay from "./CategoryDisplay";


export default async function SubjectDisplay({ subject }: { subject: Tables<'subjects'> }) {
    const { data, error } = await fetchCategories(subject.subject_number);

    return (
        <GradientContainer direction="col" className="py-16 px-8">
            <p className="font-extrabold w-full text-8xl">{subject.display_title}</p>
            {subject.description ? <p>{subject.description}</p> : <></>}

            <GradientContainer className="pt-4">
                {error != undefined ? <p>Failed to fetch categories</p> : data.map(
                    (category) => <CategoryDisplay key={category.category_number} category={category} />
                )}
            </GradientContainer>
        </GradientContainer>
    );
}
