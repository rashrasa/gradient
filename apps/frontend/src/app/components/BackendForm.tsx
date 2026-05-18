"use client";

import { HTTPRequestMethod } from "@/lib/http";
import { useState } from "react";
import MethodButton from "./BackendForm/MethodButton";
import { sendRequestToBackend } from "../actions";

export default function BackendForm() {

    const [requestData, setRequestData] = useState("");
    const [method, setMethod] = useState(HTTPRequestMethod.GET);
    const [response, setResponse] = useState<string | null>(null);
    return (
        <div className="w-full h-full">
            <div className="flex flex-row">
                <form
                    action={async (formData) => {
                        await sendRequestToBackend(
                            method,
                            formData.get("requestBody")?.toString() ?? ""
                        ).then(res => setResponse(res), rej => setResponse("Request failed. Details: " + rej));
                    }}
                    className="flex flex-col space-y-8 p-4"
                >
                    <p className="text-center w-full h-min text-md font-mono">Select your HTTP request method</p>
                    <div className="flex flex-row max-w-84 flex-wrap space-x-1 space-y-1">
                        {
                            ...Object.values(HTTPRequestMethod)
                                .filter(value => typeof value === "string")
                                .map(
                                    (type) => <MethodButton method={type} selected={type === method} onClick={(e) => { setMethod(type) }} />
                                )
                        }
                    </div>
                    <p className="text-center w-full text-md font-mono">Enter your request data</p>
                    <textarea name="requestBody" spellCheck="false" onInput={(ev) => setRequestData(ev.data)} className="bg-sky-200 w-86 h-24 focus:border-4 focus:border-black rounded-xl p-2" style={{ resize: "none" }}></textarea>
                    <button className="rounded-xl bg-sky-700 w-40 h-12 mx-auto text-white font-mono" type="submit">Submit</button>
                </form>
                <div className=" w-full p-4 space-y-8">
                    <p className="text-center font-mono">Response</p>
                    <div className="w-full h-84 bg-sky-200 rounded-xl p-4 whitespace-pre-wrap">
                        {response}
                    </div>
                </div>
            </div>
        </div >
    );
}