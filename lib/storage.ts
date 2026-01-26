export const safeGet = <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`Error reading ${key} from localStorage`, e);
        return defaultValue;
    }
};

export const safeSet = <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        // Dispatch event for reactive updates across components if needed
        window.dispatchEvent(new Event('storage-update'));
    } catch (e) {
        console.error(`Error writing ${key} to localStorage`, e);
    }
};

export const safeRemove = (key: string): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error(`Error removing ${key}`, e);
    }
};
