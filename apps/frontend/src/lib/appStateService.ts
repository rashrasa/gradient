// Server state
export class AppStateService {
    static #instance: AppStateService;
    private constructor() {
    }

    public static get instance(): AppStateService {
        if (!AppStateService.#instance) {
            AppStateService.#instance = new AppStateService();
        }

        return AppStateService.#instance
    }

}
