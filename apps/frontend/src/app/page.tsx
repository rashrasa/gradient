"use server"

import { fetchSubjects } from "./actions";
import GradientContainer from "./components/common/GradientContainer";
import SubjectDisplay from "./components/playgrounds/SubjectDisplay";

export default async function Home() {
  const { data, error } = await fetchSubjects();

  return (
    <GradientContainer z="-50" className="w-screen p-12">
      {error != undefined ? <p>Failed to fetch subjects</p> : data.map(
        (subject) => <SubjectDisplay key={subject.subject_number} subject={subject} />
      )}
    </GradientContainer>
  );
}
