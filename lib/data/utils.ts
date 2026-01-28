
/**
 * Utility to provide fallbacks for data fetching.
 * Especially useful in debug mode or when Firestore/Backend is inaccessible.
 */

export const withFallback = async <T>(
    promise: Promise<T>,
    mockData: T,
    timeoutMs: number = 2000
): Promise<T> => {
    // If we're in "debug" mode, we might want to skip real fetch entirely,
    // but for now let's just use a fast timeout.

    const timeout = new Promise<T>((resolve) => {
        setTimeout(() => {
            console.warn("Data fetch timed out, using fallback mock data.");
            resolve(mockData);
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeout]);
    } catch (e) {
        console.error("Data fetch failed, using fallback mock data.", e);
        return mockData;
    }
};

/**
 * Checks if the app is in debug/offline-mock mode.
 */
export const isMockMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('user') !== null; // For now, if logged in via debug buttons
};
