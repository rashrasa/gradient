"use client";

import { useRouter } from "next/navigation";

export interface NavigationBarRouteProps { title: string, route: string, className?: string }

export default function NavigationBarRoute({ title, route, className }: NavigationBarRouteProps) {
    const router = useRouter();
    return (
        <div
            onClick={(_) => {
                router.push(route);
            }}
            className={
                "flex items-center justify-center rounded-xl select-none "
                + "w-min h-12 px-8 "
                + "bg-sky-500 text-white font-semibold text-lg font-mono "
                + "hover:bg-sky-600 hover:cursor-pointer "
                + "active:bg-sky-700 "
                + (className ?? "")
            }
        >
            {title}
        </div>
    );
}