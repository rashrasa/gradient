"use client"

import { useEffect, useRef, useState } from "react";
import UserIconDialogMenu from "./UserIcon/UserIconDialogMenu";

export interface User {

}

export interface UserIconProps {
    className?: string,
    imageUrl: string,
    user: User,
    contextMenuEdgePaddingPx?: number
}

export default function UserIcon({ className, imageUrl, user, contextMenuEdgePaddingPx = 20 }: UserIconProps) {
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

    useEffect(() => {
        const handleFocusLoss = (ev: PointerEvent) => {
            if (imgRef.current && !imgRef.current.contains(ev.target as Node)) {
                setShowDialog(false);
            }
        };


        window.addEventListener('click', handleFocusLoss);
        return () => {
            window.removeEventListener('click', handleFocusLoss);
        }
    });
    return (
        <div>
            <img
                ref={imgRef}
                onClick={(ev) => {
                    ev.preventDefault();

                    const { x, y } = calculateMenuPosition(ev.clientX, ev.clientY);

                    setShowDialog(true);
                    setLastRightClick({ x, y });
                }}
                onContextMenu={(ev) => {
                    ev.preventDefault();

                    const { x, y } = calculateMenuPosition(ev.clientX, ev.clientY);

                    setShowDialog(true);
                    setLastRightClick({ x, y });
                }}
                className={"w-12 h-12 rounded-full bg-sky-300 hover:cursor-pointer active:brightness-75 " + (className ?? "")}
                src={imageUrl}
            />
            <UserIconDialogMenu ref={menuRef} shown={showDialog} x={lastRightClick.x} y={lastRightClick.y} />
        </div>
    );
}