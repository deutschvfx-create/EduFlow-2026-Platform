
import { db as indexedDb } from "@/lib/offline-db/client";
import { Lesson } from "@/lib/types/schedule";
import { db as firestoreDb } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    Unsubscribe
} from "firebase/firestore";

const COLLECTION_NAME = "lessons";
const subscriptions = new Map<string, Unsubscribe>();

export const scheduleRepo = {
    getAll: async (
        organizationId: string,
        onUpdate?: (lessons: Lesson[]) => void,
        options?: { teacherId?: string }
    ): Promise<Lesson[]> => {
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const lessonsRef = collection(firestoreDb, COLLECTION_NAME);
                let q = query(lessonsRef, where("organizationId", "==", organizationId));

                if (options?.teacherId) {
                    q = query(q, where("teacherId", "==", options.teacherId));
                }

                if (onUpdate) {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const lessons = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Lesson[];
                        onUpdate(lessons);
                    }, (error) => {
                        console.error("Firestore listener error:", error);
                        indexedDb.getAll<Lesson>('schedule').then(all => {
                            const filtered = all.filter(lesson => lesson.organizationId === organizationId);
                            onUpdate(filtered);
                        });
                    });
                    subscriptions.set(organizationId, unsubscribe);
                }

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
                        indexedDb.getAll<Lesson>('schedule').then(all => {
                            resolve(all.filter(lesson => lesson.organizationId === organizationId));
                        });
                    });
                });
            } catch (error) {
                console.error("Firestore error:", error);
            }
        }

        const all = await indexedDb.getAll<Lesson>('schedule');
        return all.filter(lesson => lesson.organizationId === organizationId);
    },

    getById: async (organizationId: string, id: string): Promise<Lesson | undefined> => {
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
                console.error("Firestore error:", error);
            }
        }

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

        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const lessonsRef = collection(firestoreDb, COLLECTION_NAME);
                const docRef = doc(lessonsRef, lesson.id);
                await setDoc(docRef, { ...lesson });
                await indexedDb.add('schedule', lesson);
                return;
            } catch (error) {
                console.error("Firestore add error:", error);
            }
        }
        await indexedDb.add('schedule', lesson);
    },

    update: async (organizationId: string, lesson: Lesson): Promise<void> => {
        if (lesson.organizationId !== organizationId) {
            throw new Error('Lesson organizationId does not match provided organizationId');
        }

        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const docRef = doc(firestoreDb, COLLECTION_NAME, lesson.id);
                await updateDoc(docRef, { ...lesson });
                await indexedDb.update('schedule', lesson);
                return;
            } catch (error) {
                console.error("Firestore update error:", error);
            }
        }
        await indexedDb.update('schedule', lesson);
    },

    delete: async (organizationId: string, id: string): Promise<void> => {
        const lesson = await scheduleRepo.getById(organizationId, id);
        if (lesson && lesson.organizationId !== organizationId) {
            throw new Error('Cannot delete lesson from different organization');
        }

        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const docRef = doc(firestoreDb, COLLECTION_NAME, id);
                await deleteDoc(docRef);
                await indexedDb.delete('schedule', id);
                return;
            } catch (error) {
                console.error("Firestore delete error:", error);
            }
        }
        await indexedDb.delete('schedule', id);
    },

    unsubscribe: (organizationId: string): void => {
        const unsubscribe = subscriptions.get(organizationId);
        if (unsubscribe) {
            unsubscribe();
            subscriptions.delete(organizationId);
        }
    }
};
