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

interface StatusMessage {
    severity: "good" | "warning" | "error",
    message: string
}

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        mode: "signUp",
    });

    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

    const onSubmit = async (ev: React.SubmitEvent) => {
        ev.preventDefault();
        switch (formData.mode) {
            case "login":
                const loginResult = await login(formData.email, formData.password);
                if (loginResult.success) {
                    setStatusMessage({ severity: "good", message: `Login was successful. You are now logged in as ${loginResult.user.email}` });
                } else {
                    setStatusMessage({ severity: "error", message: `Login failed. ${loginResult.error.message}` });
                }
                break;
            case "signUp":
                const signUpResult = await signUp(formData.email, formData.password);
                if (signUpResult.success) {
                    setStatusMessage({ severity: "good", message: `Sign up was successful. You are now logged in as ${signUpResult.user.email}` });
                } else {
                    setStatusMessage({ severity: "error", message: `Sign up failed. ${signUpResult.error.message}` });
                }
                break;
        }
    }

    return (
        <>
            <form
                onSubmit={onSubmit}
                className="flex flex-col items-center space-y-8"
            >
                <div className="flex flex-col bg-sky-400 p-8 rounded-xl">
                    <div className="flex flex-row ">
                        <div className="flex flex-col m-2 p-2 select-none space-y-4 text-white">
                            <p className="h-8 font-bold flex items-center">Email:</p>
                            <p className="h-8 font-bold flex items-center">Password:</p>
                        </div>
                        <div className="flex flex-col items-start m-2 p-2 select-none space-y-4">
                            <input
                                className="bg-sky-100 rounded-xl resize-none h-8 w-120 px-4 text-black"
                                name="email"
                                type="email"
                                inputMode="email"
                                value={formData.email}
                                onChange={(ev) => setFormData(prev => ({ ...prev, email: ev.target.value }) as LoginFormData)}
                            />
                            <input
                                className="bg-sky-100 rounded-xl resize-none h-8 w-120 px-4 text-black"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(ev) => setFormData(prev => ({ ...prev, password: ev.target.value }) as LoginFormData)}
                            />
                        </div>
                    </div>

                    <GradientContainer
                        className="space-x-8 p-2 justify-evenly"
                        direction="row"
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
                </div>
                <div className="flex flex-col">
                    {
                        statusMessage ?
                            <div className="flex flex-col">
                                <div>
                                    {statusMessage.message}
                                </div>
                            </div> :
                            <></>
                    }
                </div>
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