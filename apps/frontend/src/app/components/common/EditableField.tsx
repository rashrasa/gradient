"use client"

import { HTMLAttributes, useState } from "react"
import GradientContainer from "./GradientContainer";
import { Done, Edit } from "@mui/icons-material";

interface EditableFieldProps extends HTMLAttributes<HTMLTextAreaElement> {
    onStoppedEditing?: () => void
}


export default function EditableField({ onStoppedEditing, className, ...props }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);

    return (
        <GradientContainer direction="row" z="none">
            <textarea
                disabled={!editing}
                style={{ resize: "none" }}
                spellCheck={false}
                className={(editing ? "border-2 border-sky-600 rounded-xl " : "") + className}
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