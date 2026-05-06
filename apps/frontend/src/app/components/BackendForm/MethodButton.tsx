import { HTTPRequestMethod } from "@/lib/http";
import { MouseEventHandler } from "react";

export default function MethodButton({ method, selected, onClick }: { method: HTTPRequestMethod, selected: boolean, onClick: MouseEventHandler<HTMLDivElement> }) {
    return (
        <div className={"bg-sky-200 select-none hover:cursor-pointer rounded-sm p-2 h-12" + (selected ? "border-black border-2 bg-sky-600" : "")} onClick={onClick}>
            <div className="font-mono">{method}</div>
        </div>
    );
}