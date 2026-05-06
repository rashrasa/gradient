import BackendForm from "./components/BackendForm";

export default function Home() {
  return (
    <div className="flex w-screen h-screen bg-sky-50 items-center">
      <div className="flex w-[90%] h-[90%] bg-sky-100 items-center align-middle mx-auto rounded-xl">
        <div className="flex w-[80%] h-[80%] bg-sky-200 items-center align-middle mx-auto rounded-xl">
          <div className="flex w-[20%] h-[80%] bg-sky-300 items-top align-middle mx-auto border-8 rounded-xl border-sky-600 flex-col">
            <p className="text-center w-full h-min py-20 text-3xl font-mono">Welcome to Gradient!</p>
            <p className="text-center w-full h-min text-xl font-mono">Try sending an HTTP request to the backend using the main panel on the right!</p>
          </div>
          <div className="flex w-[70%] h-[80%] bg-sky-300 border-8 rounded-xl border-sky-600 items-center align-middle mx-auto">
            <BackendForm />
          </div>
        </div>
      </div>
    </div>
  );
}
