"use client"

import { updateCurrentUser } from "@/app/actions";
import EditableField from "@/app/components/common/EditableField";
import GradientContainer from "@/app/components/common/GradientContainer";
import { Tables } from "@/lib/supabase/database.types";
import { useRef, useState } from "react";

export default function UserProfile({ user, imageUrl }: { user: Tables<'users'>, imageUrl?: string }) {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [displayName, setDisplayName] = useState(user.display_name);

    return (
        <GradientContainer direction="row" className="p-8">
            <img width={300} height={300} src={imageUrl} />
            <GradientContainer direction="col" className="p-16 space-y-2 select-none items-start">
                <p className="h-8">display name:</p>
                <p className="h-8">id:</p>
                <p className="h-8">created:</p>
                <p className="h-8">updated:</p>
            </GradientContainer>
            <GradientContainer direction="col" className="p-8">
                <form className="space-y-2" ref={formRef} action={(_) => { updateCurrentUser({ displayName: displayName ?? undefined }) }}>
                    <EditableField
                        className="h-8 w-120"
                        defaultValue={displayName ?? ""}
                        onChange={(ev) => {
                            ev.preventDefault();
                            setDisplayName(ev.target.value);
                        }}
                        onStoppedEditing={() => {
                            console.log(displayName)
                            formRef.current!.requestSubmit();
                        }}
                    />
                    <p className="h-8">{user.id}</p>
                    <p className="h-8" suppressHydrationWarning>{formatTimestamp(Date.parse(user.created_at))}</p>
                    <p className="h-8" suppressHydrationWarning>{formatTimestamp(Date.parse(user.updated_at))}</p>
                </form>
            </GradientContainer>
        </GradientContainer>
    )
}

function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "long" })
}