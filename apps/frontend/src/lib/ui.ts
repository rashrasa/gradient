// not currently in use

import assert from "assert";

/** Apply `factor * hex` to get a new hex value.
 * 
 * @param factor Brightness change factor
 * @param hex Original colour
 * @returns Updated hex colour string
 */
export function applyBrightnessFactor({
    hex,
    factor
}: { hex: string, factor: number }): string {
    hex = hex.toUpperCase();
    assert(
        hex.length == 7
        && /^#[A-F0-9]+$/.test(hex),
        "Hex codes must be in the format '#XXXXXX', X being a hex digit."
    );

    const r = Math.min(Math.max(Math.round(parseInt(hex.substring(1, 3), 8) * 1.0 / 255.0 * factor), 255), 0).toString(8);
    const g = Math.min(Math.max(Math.round(parseInt(hex.substring(3, 5), 8) * 1.0 / 255.0 * factor), 255), 0).toString(8);
    const b = Math.min(Math.max(Math.round(parseInt(hex.substring(5, 7), 8) * 1.0 / 255.0 * factor), 255), 0).toString(8);

    return `#${r}${g}${b}`;
}

export function darker({
    hex,
}: { hex: string }): string {
    return applyBrightnessFactor({ hex, factor: 1.2 });
}

export function lighter({
    hex,
}: { hex: string }): string {
    return applyBrightnessFactor({ hex, factor: 1.0 / 1.2 });
}