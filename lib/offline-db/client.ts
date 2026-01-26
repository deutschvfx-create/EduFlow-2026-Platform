'use client';

const DB_NAME = 'eduflow-db';
const DB_VERSION = 1;

export const STORES = [
    'students',
    'teachers',
    'groups',
    'courses',
    'schedule',
    'attendance',
    'grades',
    'outbox' // For sync events
];

export interface OutboxEvent {
    id: string;
    entity: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    createdAt: string;
    status: 'PENDING' | 'SENT' | 'FAILED';
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error("IndexedDB is client-side only"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            STORES.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic CRUD
export const db = {
    getAll: async <T>(storeName: string): Promise<T[]> => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    getById: async <T>(storeName: string, id: string): Promise<T | undefined> => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            // request.result is undefined if not found
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    add: async <T extends { id: string }>(storeName: string, item: T) => {
        const db = await openDB();
        const tx = db.transaction([storeName, 'outbox'], 'readwrite');

        // 1. Write to Store
        tx.objectStore(storeName).put(item);

        // 2. Write to Outbox
        const event: OutboxEvent = {
            id: crypto.randomUUID(),
            entity: storeName,
            action: 'CREATE',
            payload: item,
            createdAt: new Date().toISOString(),
            status: 'PENDING'
        };
        tx.objectStore('outbox').put(event);

        return new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    update: async <T extends { id: string }>(storeName: string, item: T) => {
        const db = await openDB();
        const tx = db.transaction([storeName, 'outbox'], 'readwrite');

        tx.objectStore(storeName).put(item);

        const event: OutboxEvent = {
            id: crypto.randomUUID(),
            entity: storeName,
            action: 'UPDATE',
            payload: item,
            createdAt: new Date().toISOString(),
            status: 'PENDING'
        };
        tx.objectStore('outbox').put(event);

        return new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    delete: async (storeName: string, id: string) => {
        const db = await openDB();
        const tx = db.transaction([storeName, 'outbox'], 'readwrite');

        tx.objectStore(storeName).delete(id);

        const event: OutboxEvent = {
            id: crypto.randomUUID(),
            entity: storeName,
            action: 'DELETE',
            payload: { id },
            createdAt: new Date().toISOString(),
            status: 'PENDING'
        };
        tx.objectStore('outbox').put(event);

        return new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    // Helper to seed data if empty
    seedIfEmpty: async <T>(storeName: string, initialData: T[]) => {
        const items = await db.getAll(storeName);
        if (items.length === 0 && initialData.length > 0) {
            console.log(`Seeding ${storeName} with ${initialData.length} items`);
            for (const item of initialData) {
                // Warning: seeding usually shouldn't trigger outbox, but for PWA demo we'll allow standard add flow or direct put
                // Using direct put to avoid massive outbox spam on first load
                const _db = await openDB();
                const tx = _db.transaction(storeName, 'readwrite');
                // @ts-ignore
                tx.objectStore(storeName).put(item);
            }
        }
    }
};
