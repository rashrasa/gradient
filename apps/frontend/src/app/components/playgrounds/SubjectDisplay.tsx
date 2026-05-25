"use server"

import GradientContainer from "../common/GradientContainer";
import CategoryDisplay from "./CategoryDisplay";
import { Category, PLAYGROUNDS, Subject, SubjectDescriptor } from "@/lib/playgrounds/playground";


export default async function SubjectDisplay({ number }: { number: Subject }) {
    const subject = PLAYGROUNDS.subjects[number];

    return (
        <GradientContainer direction="col" className="py-16 px-8">
            <p className="font-extrabold w-full text-8xl">{subject.title}</p>
            {subject.description ? <p>{subject.description}</p> : <></>}

            <GradientContainer className="pt-4">
                {Object.entries(PLAYGROUNDS.categories).filter((v) => v[1].subject == number).map(
                    ([number, category]) => <CategoryDisplay key={number} number={number as Category} />
                )}
            </GradientContainer>
        </GradientContainer>
    );
}
