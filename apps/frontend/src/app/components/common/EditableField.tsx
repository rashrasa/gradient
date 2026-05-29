"use client"

import { HTMLAttributes, useEffect, useRef, useState } from "react"
import GradientContainer from "./GradientContainer";
import { Done, Edit } from "@mui/icons-material";

interface EditableFieldProps extends HTMLAttributes<HTMLTextAreaElement> {
    onStoppedEditing?: () => void
}


export default function EditableField({ onStoppedEditing, className, ...props }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (editing) {
            textAreaRef.current!.focus()
        }
    }, [editing])

    return (
        <GradientContainer direction="row" z="none">
            <textarea
                ref={textAreaRef}
                disabled={!editing}
                style={{ resize: "none" }}
                spellCheck={false}
                className={(editing ? "border-2 border-sky-600 bg-white rounded-md px-2 " : "") + className}
                {...props}
            />
            <div
                className="hover:cursor-pointer"
                onClick={(ev) => {
                    ev.preventDefault();
                    if (editing) {
                        if (onStoppedEditing) onStoppedEditing();
                        setEditing(false);
                    } else {
                        setEditing(true);
                    }
                }}
            >
                {editing ? <Done /> : <Edit />}
            </div>
        </GradientContainer>
    );
}