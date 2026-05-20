"use client"

import { Tables } from "@/lib/supabase/database.types";
import UserIconDialogMenu from "./UserIcon/UserIconDialogMenu";
import { MouseEventHandler, useEffect, useRef, useState } from "react";

const contextMenuEdgePaddingPx = 20;

export default function UserIcon({ user, icon }: { user: Tables<'users'> | null, icon?: string }) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [lastRightClick, setLastRightClick] = useState({ x: 0, y: 0 });

    const calculateMenuPosition = (clickX: number, clickY: number) => {
        const menuWidth = menuRef.current?.clientWidth ?? 0;
        const menuHeight = menuRef.current?.clientHeight ?? 0;

        // TODO: Check every overflow direction

        // check left overflow
        const menuX = clickX - Math.max(0, (clickX + menuWidth + contextMenuEdgePaddingPx) - window.innerWidth);
        const menuY = clickY;

        return { x: menuX, y: menuY }
    };

    const showMenu = (mouseX: number, mouseY: number) => {
        const { x, y } = calculateMenuPosition(mouseX, mouseY);
        setShowDialog(true);
        setLastRightClick({ x, y });
    }

    const handleFocusLoss = (ev: PointerEvent) => {
        if (imgRef.current && !imgRef.current.contains(ev.target as Node)) {
            setShowDialog(false);
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleFocusLoss);
        return () => {
            window.removeEventListener('click', handleFocusLoss);
        }
    });

    return (
        <div
            onClick={(ev) => {
                ev.preventDefault();
                showMenu(ev.clientX, ev.clientY);
            }}
            onContextMenu={(ev) => {
                ev.preventDefault();
                showMenu(ev.clientX, ev.clientY);
            }}
        >
            <img ref={imgRef} src={icon} className={"w-12 h-12 rounded-full bg-sky-300 hover:cursor-pointer active:brightness-75 "} />
            <UserIconDialogMenu ref={menuRef} user={user} shown={showDialog} x={lastRightClick.x} y={lastRightClick.y} />
        </div>
    );
}