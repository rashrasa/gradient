import { SvgIconComponent } from "@mui/icons-material";
import { HTMLAttributes } from "react";

export interface StackedHoverIconProps extends HTMLAttributes<HTMLDivElement> {
    Icon: SvgIconComponent
    label?: string
}

export default function StackedHoverIcon({ Icon, label, ...props }: StackedHoverIconProps) {
    return (
        <div
            {...props}>
            <Icon sx={{ width: "50%", height: "50%" }} />
            {label ? <p>{label}</p> : <></>}
        </div>
    );
}