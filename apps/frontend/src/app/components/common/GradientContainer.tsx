// not currently in use

import { darker, lighter } from "@/lib/ui";
import { assert } from "console";

export interface GradientContainerProps {
    children?: any,
    backgroundLayers?: number,
    backgroundLayerSpacing?: number,
    backgroundLayerShadingInverted?: boolean,
    foregroundColourHex?: string,
}

/**
 * 
 * @param foregroundColourHex Colours too light or dark may be drowned out.
 */
export default function GradientContainer({
    children,
    backgroundLayers = 3,
    backgroundLayerSpacing = 4,
    backgroundLayerShadingInverted = false,
    foregroundColourHex = "#25A7DA" // Sky blue
}: GradientContainerProps): React.ReactNode {
    assert(backgroundLayers > 0, "Cannot create a container without at least one layer.");

    for (let i = 0; i < backgroundLayers!; i++) {
        foregroundColourHex = backgroundLayerShadingInverted ? darker({ hex: foregroundColourHex }) : lighter({ hex: foregroundColourHex });
    }
    return GradientContainerRecursive({
        children,
        backgroundLayers: backgroundLayers,
        backgroundLayerSpacing,
        backgroundLayerShadingInverted,
        foregroundColourHex,
    });
}

function GradientContainerRecursive({
    children,
    backgroundLayers,
    backgroundLayerSpacing,
    backgroundLayerShadingInverted,
    foregroundColourHex,
}: GradientContainerProps): React.ReactNode {
    if (backgroundLayers == 0) {
        return children;
    }
    else {
        return (
            <div
                className="flex justify-center items-center"
                style={{
                    backgroundColor: foregroundColourHex,
                    padding: backgroundLayerSpacing
                }}
            >
                {GradientContainerRecursive({
                    children,
                    backgroundLayers: backgroundLayers! - 1,
                    backgroundLayerShadingInverted,
                    backgroundLayerSpacing,
                    foregroundColourHex: backgroundLayerShadingInverted ? lighter({ hex: foregroundColourHex! }) : darker({ hex: foregroundColourHex! })
                })}
            </div>
        );
    }
}