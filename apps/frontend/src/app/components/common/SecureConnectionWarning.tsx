"use client"

import { HTMLAttributes, useEffect, useState } from "react";

export interface SecureConnectionWarningProps extends HTMLAttributes<HTMLParagraphElement> { }

export default function SecureConnectionWarning({ className, ...props }: SecureConnectionWarningProps) {
    const [message, setMessage] = useState<string | null>(null);
    const [colour, setColour] = useState<string | null>(null);
    useEffect(() => {
        if (window.location.protocol === "https") {
            setMessage(null);
        } else if (window.location.hostname === "localhost") {
            setMessage("Server is running on the current machine. Connection is secure.");
            setColour("bg-blue-400 text-white");
        } else {
            setMessage("Warning: this connection is unsecure. Anyone can read the network traffic being made to this site. Avoid entering sensitive credentials until this is resolved.");
            setColour("bg-amber-300 text-black")
        }
    });

    return (
        <>
            {
                (message == null)
                    ? <></>
                    : <p
                        className={`select-none font-mono font-bold shadow-xl box-border border border-black z-20 text-sm pl-8 p-1 ${className ?? ""} ${colour}`} {...props}
                    >{message}</p>
            }
        </>
    )
}