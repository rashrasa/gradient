"use client"

import { HTMLAttributes, MouseEventHandler, Ref } from "react";
import { useRouter } from "next/navigation";
import { logOut } from "@/app/actions";
import { Tables } from "@/lib/supabase/database.types";

export interface UserIconDialogMenuProps extends HTMLAttributes<HTMLDivElement> {
    ref?: Ref<HTMLDivElement>,
    user: Tables<'users'> | null,
    shown?: boolean,
    x?: number,
    y?: number,
}

interface UserIconDialogMenuItem {
    text: string,
    onClick?: MouseEventHandler<HTMLDivElement>
}

export default function UserIconDialogMenu({ ref, user, shown = false, x = 0, y = 0, ...props }: UserIconDialogMenuProps) {
    const router = useRouter();
    const contextMenuItems: UserIconDialogMenuItem[] = [
        ...((user) ? [
            {
                text: `User: ${(user.display_name != null) ? user.display_name : user.id}`,
                onClick: async (ev) => {
                    ev.preventDefault();
                    router.push("/login");
                }
            }
        ] as UserIconDialogMenuItem[] : []),
        {
            text: (user != null) ? "Log Out" : "Login",
            onClick: async (ev) => {
                ev.preventDefault();
                if (user != null) {
                    // Handle logout
                    await logOut();
                } else {
                    router.push("/login");
                }
            }
        }
    ];

    let childComponents = contextMenuItems.map(
        (item) =>
            <div
                onClick={
                    item.onClick
                }
                className={
                    "p-2 w-full text-center "
                    + (item.onClick ? "hover:cursor-pointer hover:bg-sky-50 select-none" : "")
                }
            >
                {item.text}
            </div>
    );

    // assuming condition is re-evaluated each time
    for (let i = 0; i < childComponents.length; i++) {
        if (i != childComponents.length - 1) {
            childComponents.splice(i + 1, 0, <hr className="border border-solid border-black w-full" />);
            i++;
        }
    }

    return (
        <div
            ref={ref}
            style={{ top: `${y}px`, left: `${x}px` }}
            className={
                `absolute shadow-xl` +
                "justify-center items-center border-2 border-sky-500 rounded-lg " +
                "flex flex-col space-y-4 p-2 w-max bg-sky-100 "
                + (shown ? "visible" : "invisible")
            }>
            {...childComponents}
        </div>
    );
}