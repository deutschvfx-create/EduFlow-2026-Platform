/**
 * Universal Polyfills for WebView Stability
 * These polyfills ensure that modern APIs are available or at least don't crash 
 * in older Android WebView environments.
 */

if (typeof window !== 'undefined') {
    // 1. crypto.randomUUID Polyfill
    if (!window.crypto) {
        (window as any).crypto = {} as Crypto;
    }

    if (!window.crypto.randomUUID) {
        console.warn('Polyfilling crypto.randomUUID for this environment');
        window.crypto.randomUUID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }) as `${string}-${string}-${string}-${string}-${string}`;
        };
    }

    // 2. Object.hasOwn Polyfill (ES2022)
    if (!Object.hasOwn) {
        console.warn('Polyfilling Object.hasOwn');
        Object.hasOwn = function (obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };
    }

    // 3. Array.prototype.at & String.prototype.at Polyfill (ES2022)
    const atPolyfill = function (this: any, n: number) {
        // ToInteger() abstract op
        n = Math.trunc(n) || 0;
        // Allow negative indexing from the end
        if (n < 0) n += this.length;
        // OOB access
        if (n < 0 || n >= this.length) return undefined;
        return this[n];
    };

    if (!Array.prototype.at) {
        console.warn('Polyfilling Array.prototype.at');
        Object.defineProperty(Array.prototype, 'at', {
            value: atPolyfill,
            configurable: true,
            writable: true
        });
    }

    if (!String.prototype.at) {
        console.warn('Polyfilling String.prototype.at');
        Object.defineProperty(String.prototype, 'at', {
            value: atPolyfill,
            configurable: true,
            writable: true
        });
    }

    // 4. structuredClone Polyfill (Fallback to JSON for simple objects)
    if (typeof window.structuredClone !== 'function') {
        console.warn('Polyfilling structuredClone (Limited JSON fallback)');
        window.structuredClone = function (obj: any) {
            try {
                return JSON.parse(JSON.stringify(obj));
            } catch (e) {
                console.error('structuredClone fallback failed:', e);
                return obj; // Last resort: return shallow or original
            }
        };
    }

    // 5. ResizeObserver No-op
    if (!window.ResizeObserver) {
        console.warn('Polyfilling ResizeObserver as No-op');
        window.ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        };
    }

    // 6. IntersectionObserver No-op
    if (!window.IntersectionObserver) {
        console.warn('Polyfilling IntersectionObserver as No-op');
        window.IntersectionObserver = class IntersectionObserver {
            readonly root: Element | Document | null = null;
            readonly rootMargin: string = '';
            readonly thresholds: ReadonlyArray<number> = [];
            observe() { }
            unobserve() { }
            disconnect() { }
            takeRecords() { return []; }
        } as any;
    }

    // 7. Global Error Catching for "Client-side exception"
    // This won't stop the error, but it helps log it in the console for debug
    window.addEventListener('error', (event) => {
        console.error('GLOBAL WEBVIEW ERROR:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    });
}
