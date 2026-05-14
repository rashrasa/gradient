"use client"

import { login, signUp } from "@/app/actions";
import GradientContainer from "@/app/components/common/GradientContainer";
import { useState } from "react";

type LoginFormMode = "login" | "signUp";
interface LoginFormModeMetadata {
    displayTitle: string,

}

const loginFormMetadataMapping: { [K in LoginFormMode]: LoginFormModeMetadata } = {
    "login": { displayTitle: "Login" },
    "signUp": { displayTitle: "Sign Up" },
};

interface LoginFormData {
    email: string,
    password: string,
    mode: LoginFormMode
}

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        mode: "signUp",
    });

    const onSubmit = async (ev: React.SubmitEvent) => {
        ev.preventDefault();
        switch (formData.mode) {
            case "login":
                console.log(await login(formData.email, formData.password));
                break;
            case "signUp":
                console.log(await signUp(formData.email, formData.password));
                break;
        }
    }

    return (
        <>
            <form
                onSubmit={onSubmit}
                className="flex flex-col items-center space-y-8"
            >
                <label className="m-2 p-2 select-none">
                    Email:
                    <input
                        className="bg-sky-100 rounded-xl resize-none h-8 w-48"
                        name="email"
                        type="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={(ev) => setFormData(prev => ({ ...prev, email: ev.target.value }) as LoginFormData)}
                    />
                </label>

                <label className="m-2 p-2 select-none">
                    Password:
                    <input
                        className="bg-sky-100 rounded-xl resize-none h-8 w-48"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(ev) => setFormData(prev => ({ ...prev, password: ev.target.value }) as LoginFormData)}
                    />
                </label>

                <GradientContainer
                    className="space-x-8 p-2"
                    flexDirection="flex-row"
                >
                    {Object.entries(loginFormMetadataMapping).map(([mode, modeMetadata]) =>
                        <label key={mode} className="m-2 select-none">
                            <input
                                key={mode}
                                name="loginRadio"
                                type="radio"
                                value={mode}
                                checked={formData.mode === mode}
                                onChange={() => setFormData(prev => ({ ...prev, mode: mode }) as LoginFormData)}
                            />
                            {modeMetadata.displayTitle}
                        </label>
                    )}
                </GradientContainer>
                <button
                    className="font-mono text-white justify-center border-2 border-black rounded-xl w-40 bg-sky-700 select-none h-12 hover:bg-sky-500 active:bg-sky-900"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </>
    );
}