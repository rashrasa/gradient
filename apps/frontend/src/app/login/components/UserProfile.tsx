"use client"

import { updateCurrentUser, uploadAvatar } from "@/app/actions";
import EditableField from "@/app/components/common/EditableField";
import GradientContainer from "@/app/components/common/GradientContainer";
import StackedHoverIcon from "@/app/components/common/StackedHoverIcon";
import { Tables } from "@/lib/supabase/database.types";
import { Person, Upload } from "@mui/icons-material";
import { ChangeEventHandler, useRef, useState } from "react";

export default function UserProfile({ user, imageUrl }: { user: Tables<'users'>, imageUrl?: string }) {
    const formRef = useRef<HTMLFormElement>(null);
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [displayName, setDisplayName] = useState(user.display_name);

    const onUploadNewImage: ChangeEventHandler<HTMLInputElement> = async (_) => {
        if ((imageUploadRef.current!.files?.length ?? 0) > 0) {
            const file = imageUploadRef.current!.files!.item(0)!;
            const error = await uploadAvatar(file);
            if (error != null) {
                console.error(error)
            }

        }
    };

    return (
        <GradientContainer direction="row" className="p-8">
            <input ref={imageUploadRef} type="file" className="hidden" onChange={onUploadNewImage} />
            <div className="w-75 h-75 border rounded-md relative group flex flex-col items-center justify-center bg-white">
                {
                    imageUrl ?
                        <img src={imageUrl} width={"full"} height={"full"} className="absolute group-hover:opacity-30" /> :
                        <Person className="absolute group-hover:opacity-0" sx={{ width: "50%", height: "50%" }} />
                }
                <StackedHoverIcon
                    className={"w-full h-full z-10 absolute top-0 left-0 " +
                        "flex flex-col items-center justify-center " +
                        "group-hover:bg-gray-300 opacity-0 group-hover:opacity-70 group-hover:cursor-pointer"}
                    Icon={Upload}
                    label="Upload New Image"
                    onClick={() => imageUploadRef.current!.click()}
                />
            </div>
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