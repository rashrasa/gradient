import { MouseEventHandler, Ref } from "react";
import { User } from "@/lib/user";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logOut } from "@/app/actions";

export interface UserIconDialogMenuProps {
    ref?: Ref<HTMLDivElement>,
    user?: User,
    shown?: boolean,
    x?: number,
    y?: number,
}

interface UserIconDialogMenuItem {
    text: string,
    onClick?: MouseEventHandler<HTMLDivElement>
}

export default function UserIconDialogMenu({ ref, user, shown = false, x = 0, y = 0 }: UserIconDialogMenuProps) {
    const router = useRouter();
    const contextMenuItems: UserIconDialogMenuItem[] = [
        {
            text: (user) ? "Log Out" : "Login",
            onClick: async (ev) => {
                if (user) {
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
                    "hover:bg-sky-50 p-2 select-none w-full text-center "
                    + (item.onClick ? "hover:cursor-pointer" : "")
                }
            >
                {item.text}
            </div>
    );

    // assuming condition is re-evaluated each time
    for (let i = 0; i < childComponents.length; i++) {
        if (i != childComponents.length - 1) {
            childComponents.push(<hr className="border-2 border-solid border-black" />);
            i++;
        }
    }


    return (
        <div
            ref={ref}
            style={{ top: `${y}px`, left: `${x}px` }}
            className={
                `absolute ` +
                "justify-center items-center border-2 border-sky-500 rounded-lg " +
                "flex flex-col space-y-4 p-2 w-max bg-sky-100 "
                + (shown ? "visible" : "invisible")
            }>
            {...childComponents}
        </div>
    );
}