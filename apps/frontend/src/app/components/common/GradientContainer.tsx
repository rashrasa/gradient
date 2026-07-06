"use client"

import { HTMLAttributes, } from "react";

export interface Colour {
    r: number, g: number, b: number, a: number
}

export type GradientZIndex = "-50" | "-40" | "-30" | "-20" | "-10" | "0" | "10" | "20" | "30" | "40" | "50" | "none";
export type FlexDirection = "col" | "row";

const zClassScheme: {
    [K in GradientZIndex]: string
} = {
    "50": "bg-sky-1000 text-white",
    "40": "bg-sky-900 text-white",
    "30": "bg-sky-800 text-white",
    "20": "bg-sky-700 text-white",
    "10": "bg-sky-600 text-white",
    "0": "bg-sky-500 text-white",
    "-10": "bg-sky-400 text-white",
    "-20": "bg-sky-300 text-white",
    "-30": "bg-sky-200 text-sky-500",
    "-40": "bg-sky-100 text-sky-500",
    "-50": "bg-sky-50 text-sky-500",
    "none": ""
}

interface GradientContainerProps extends HTMLAttributes<HTMLDivElement> {
    ref?: React.Ref<HTMLDivElement> | undefined,
    z?: GradientZIndex,
    text?: string,
    border?: string,
    layout?: string,
    direction?: FlexDirection,
}

export default function GradientContainer({
    ref,
    children,
    className,
    z = "-40",
    direction: flexDirection = "col",
    text = "font-mono",
    border = "rounded-xl",
    layout = "justify-center",
    ...props
}: GradientContainerProps) {
    const zClasses = zClassScheme[z];
    return (
        <div
            ref={ref as any | undefined}
            className={`flex flex-${flexDirection} ${layout} ${zClasses} ${className ?? ""} ${text} ${border}`}
            {...props}
        >
            {children}
        </div>
    );
}