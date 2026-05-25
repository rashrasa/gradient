"use server"

import { PLAYGROUNDS, Subject } from "@/lib/playgrounds/playground";
import GradientContainer from "./components/common/GradientContainer";
import SubjectDisplay from "./components/playgrounds/SubjectDisplay";

export default async function Home() {
  return (
    <GradientContainer z="-50" className="w-screen p-12">
      {Object.entries(PLAYGROUNDS.subjects).map(
        ([number, subject]) => <SubjectDisplay key={number} number={number as Subject} />
      )}
    </GradientContainer>
  );
}
