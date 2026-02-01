import { db as indexedDb } from "@/lib/offline-db/client";
import { Lesson } from "@/lib/types/schedule";
import { MOCK_SCHEDULE } from "@/lib/mock/schedule";
import { db as firestoreDb } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Unsubscribe
} from "firebase/firestore";

// Firestore collection name
const COLLECTION_NAME = "lessons";

// Active subscriptions tracker
const subscriptions = new Map<string, Unsubscribe>();

export const scheduleRepo = {
    /**
     * Get all lessons for an organization with realtime updates
     * Returns a Promise that resolves immediately with current data
     * and sets up realtime listener if callback is provided
     */
    getAll: async (
        organizationId: string,
        onUpdate?: (lessons: Lesson[]) => void,
        options?: { teacherId?: string }
    ): Promise<Lesson[]> => {
        // Try Firestore first
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const lessonsRef = collection(firestoreDb, COLLECTION_NAME);
                let q = query(lessonsRef, where("organizationId", "==", organizationId));

                if (options?.teacherId) {
                    q = query(q, where("teacherId", "==", options.teacherId));
                }

                // If callback provided, set up realtime listener
                if (onUpdate) {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const lessons = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Lesson[];
                        onUpdate(lessons);
                    }, (error) => {
                        console.error("Firestore listener error:", error);
                        // Fallback to IndexedDB on error
                        indexedDb.seedIfEmpty('schedule', MOCK_SCHEDULE).then(() => {
                            return indexedDb.getAll<Lesson>('schedule');
                        }).then(all => {
                            const filtered = all.filter(lesson => lesson.organizationId === organizationId);
                            onUpdate(filtered);
                        });
                    });

                    // Store subscription for cleanup
                    subscriptions.set(organizationId, unsubscribe);
                }

                // Return initial data synchronously
                return new Promise((resolve) => {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const lessons = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Lesson[];
                        unsubscribe();
                        resolve(lessons);
                    }, (error) => {
                        console.error("Firestore initial fetch error:", error);
                        unsubscribe();
                        // Fallback to IndexedDB
                        indexedDb.seedIfEmpty('schedule', MOCK_SCHEDULE).then(() => {
                            return indexedDb.getAll<Lesson>('schedule');
                        }).then(all => {
                            resolve(all.filter(lesson => lesson.organizationId === organizationId));
                        });
                    });
                });
            } catch (error) {
                console.error("Firestore error, falling back to IndexedDB:", error);
            }
        }

        // Fallback to IndexedDB (SSR or Firestore unavailable)
        await indexedDb.seedIfEmpty('schedule', MOCK_SCHEDULE);
        const all = await indexedDb.getAll<Lesson>('schedule');
        return all.filter(lesson => lesson.organizationId === organizationId);
    },

    getById: async (organizationId: string, id: string): Promise<Lesson | undefined> => {
        // Try Firestore first
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const docRef = doc(firestoreDb, COLLECTION_NAME, id);
                return new Promise((resolve) => {
                    const unsubscribe = onSnapshot(docRef, (docSnap) => {
                        unsubscribe();
                        if (docSnap.exists()) {
                            const lesson = { id: docSnap.id, ...docSnap.data() } as Lesson;
                            if (lesson.organizationId === organizationId) {
                                resolve(lesson);
                            } else {
                                resolve(undefined);
                            }
                        } else {
                            resolve(undefined);
                        }
                    }, (error) => {
                        console.error("Firestore getById error:", error);
                        unsubscribe();
                        // Fallback to IndexedDB
                        indexedDb.getById<Lesson>('schedule', id).then(lesson => {
                            if (lesson && lesson.organizationId === organizationId) {
                                resolve(lesson);
                            } else {
                                resolve(undefined);
                            }
                        });
                    });
                });
            } catch (error) {
                console.error("Firestore error, falling back to IndexedDB:", error);
            }
        }

        // Fallback to IndexedDB
        const lesson = await indexedDb.getById<Lesson>('schedule', id);
        if (lesson && lesson.organizationId === organizationId) {
            return lesson;
        }
        return undefined;
    },

    add: async (organizationId: string, lesson: Lesson): Promise<void> => {
        if (lesson.organizationId !== organizationId) {
            throw new Error('Lesson organizationId does not match provided organizationId');
        }

        // Try Firestore first
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const lessonsRef = collection(firestoreDb, COLLECTION_NAME);
                await addDoc(lessonsRef, lesson);
                // Also add to IndexedDB for offline support
                await indexedDb.add('schedule', lesson);
                return;
            } catch (error) {
                console.error("Firestore add error, falling back to IndexedDB:", error);
            }
        }

        // Fallback to IndexedDB
        return indexedDb.add('schedule', lesson);
    },

    update: async (organizationId: string, lesson: Lesson): Promise<void> => {
        if (lesson.organizationId !== organizationId) {
            throw new Error('Lesson organizationId does not match provided organizationId');
        }

        // Try Firestore first
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const docRef = doc(firestoreDb, COLLECTION_NAME, lesson.id);
                await updateDoc(docRef, { ...lesson });
                // Also update IndexedDB for offline support
                await indexedDb.update('schedule', lesson);
                return;
            } catch (error) {
                console.error("Firestore update error, falling back to IndexedDB:", error);
            }
        }

        // Fallback to IndexedDB
        return indexedDb.update('schedule', lesson);
    },

    delete: async (organizationId: string, id: string): Promise<void> => {
        // Verify ownership first
        const lesson = await scheduleRepo.getById(organizationId, id);
        if (lesson && lesson.organizationId !== organizationId) {
            throw new Error('Cannot delete lesson from different organization');
        }

        // Try Firestore first
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const docRef = doc(firestoreDb, COLLECTION_NAME, id);
                await deleteDoc(docRef);
                // Also delete from IndexedDB for offline support
                await indexedDb.delete('schedule', id);
                return;
            } catch (error) {
                console.error("Firestore delete error, falling back to IndexedDB:", error);
            }
        }

        // Fallback to IndexedDB
        return indexedDb.delete('schedule', id);
    },

    /**
     * Unsubscribe from realtime updates for an organization
     */
    unsubscribe: (organizationId: string): void => {
        const unsubscribe = subscriptions.get(organizationId);
        if (unsubscribe) {
            unsubscribe();
            subscriptions.delete(organizationId);
        }
    }
};
