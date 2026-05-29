const PROFILING = true;

export function record(action: string): () => void {
    if (PROFILING) {
        const now = performance.now();
        return () => {
            console.log(`${action} took ${performance.now() - now}ms`)
        }
    } else {
        return () => { return };
    }

}