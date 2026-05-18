"use client"

import { HTMLAttributes, useEffect, useState } from "react";

type ConnectionState = "secure" | "dev" | "unsecure";
type ShowMessage = string | null;
const defaultConnectionStateMessage: { [K in ConnectionState]: ShowMessage } = {
    secure: null,
    dev: "Server is running on the current machine. Connection is secure. Ideally, avoid entering personal credentials since they will be visible on stdout.",
    unsecure: "Warning: this connection is unsecure. Anyone can read the network traffic being made to this site. Avoid entering sensitive credentials until this is resolved."
}

export interface SecureConnectionWarningProps extends HTMLAttributes<HTMLParagraphElement> {
    messageOverrides?: {
        [K in ConnectionState]: ShowMessage | undefined
    }
}

export default function SecureConnectionWarning({ messageOverrides, className, ...props }: SecureConnectionWarningProps) {
    const [message, setMessage] = useState<string | null>(null);
    const [colour, setColour] = useState<string | null>(null);
    useEffect(() => {
        if (window.location.protocol === "https") {
            setMessage(messageOverrides?.secure ?? defaultConnectionStateMessage['secure']);
        } else if (window.location.hostname === "localhost") {
            setMessage(messageOverrides?.dev ?? defaultConnectionStateMessage['dev']);
            setColour("bg-blue-400 text-white");
        } else {
            setMessage(messageOverrides?.unsecure ?? defaultConnectionStateMessage['unsecure']);
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