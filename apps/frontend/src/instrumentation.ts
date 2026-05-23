import { AppStateService } from "./lib/appStateService"

import { get_state, ReadableState } from "fourier-engine";

export function register() {
    switch (get_state()) {
        case ReadableState.Ready:
            console.log("WASM module started with a ReadableState.Ready state");
            break;
        case ReadableState.SignalLoaded:
            console.log("WASM module started with a ReadableState.SignalLoaded state");
            break;
    }

    // Initialization
    const isProd = process.env.GRADIENT_IS_PROD == "true"

    AppStateService.instance;
}