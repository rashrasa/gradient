import { AppStateService } from "./lib/appStateService"

export function register() {
    // Initialization
    const isProd = process.env.GRADIENT_IS_PROD == "true"

    AppStateService.instance;
}