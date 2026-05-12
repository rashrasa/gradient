import { Metadata } from "next";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage() {
    return (
        <div className="flex flex-col m-20 p-20 bg-sky-200 rounded-xl">
            <div className="flex flex-col p-20 bg-sky-300 space-y-8">
                <div className="text-white text-5xl text-center font-mono font-extrabold"
                >Welcome to Gradient!</div>
                <div className="text-white text-xl text-center font-mono font-extrabold"
                >Enter your credentials to continue</div>
            </div>
        </div>
    )
};