import { Metadata } from "next";
import LoginForm from "./components/LoginForm";
import GradientContainer from "../components/common/GradientContainer";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage() {
    return (
        <GradientContainer
            z="-30"
            flexDirection="flex-col"
            className="mt-20 p-20 w-min mx-auto"
        >
            <GradientContainer
                z="-20"
                flexDirection="flex-col"
                className="space-y-8 p-20 w-min mx-auto"
            >
                <GradientContainer
                    z="-10"
                    flexDirection="flex-col"
                    className="text-white text-center font-extrabold p-4 w-300 mx-auto space-y-4"
                >
                    <p className="text-5xl">Welcome to Gradient!</p>
                    <p className="text-xl">Enter your credentials to continue</p>
                </GradientContainer>
                <LoginForm />
            </GradientContainer>
        </GradientContainer>
    )
};