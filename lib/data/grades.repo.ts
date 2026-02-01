import { db as indexedDb } from "@/lib/offline-db/client";
import { GradeRecord } from "@/lib/types/grades";
import { db as firestoreDb } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    doc,
    setDoc,
    Unsubscribe
} from "firebase/firestore";

const COLLECTION_NAME = "grades";
const subscriptions = new Map<string, Unsubscribe>();

export const gradesRepo = {
    getAll: async (
        organizationId: string,
        onUpdate?: (records: GradeRecord[]) => void,
        options?: { studentId?: string; groupId?: string; courseId?: string }
    ): Promise<GradeRecord[]> => {
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const gradesRef = collection(firestoreDb, COLLECTION_NAME);
                let q = query(gradesRef, where("organizationId", "==", organizationId));

                if (options?.studentId) {
                    q = query(q, where("studentId", "==", options.studentId));
                }
                if (options?.groupId) {
                    q = query(q, where("groupId", "==", options.groupId));
                }
                if (options?.courseId) {
                    q = query(q, where("courseId", "==", options.courseId));
                }

                if (onUpdate) {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const records = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as GradeRecord[];
                        onUpdate(records);
                    }, (error) => {
                        console.error("Grades listener error:", error);
                        indexedDb.getAll<GradeRecord>('grades').then(all => {
                            onUpdate(all.filter(r => r.organizationId === organizationId));
                        });
                    });
                    subscriptions.set(organizationId, unsubscribe);
                }

                return new Promise((resolve) => {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const records = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as GradeRecord[];
                        unsubscribe();
                        resolve(records);
                    }, (error) => {
                        console.error("Grades initial fetch error:", error);
                        unsubscribe();
                        indexedDb.getAll<GradeRecord>('grades').then(all => {
                            resolve(all.filter(r => r.organizationId === organizationId));
                        });
                    });
                });
            } catch (error) {
                console.error("Firestore grades error:", error);
            }
        }

        const all = await indexedDb.getAll<GradeRecord>('grades');
        return all.filter(r => r.organizationId === organizationId);
    },

    save: async (organizationId: string, record: GradeRecord): Promise<void> => {
        const recordToSave = {
            ...record,
            organizationId,
            updatedAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const gradesRef = collection(firestoreDb, COLLECTION_NAME);
                if (record.id.startsWith('new-') || !record.id) {
                    const docRef = await addDoc(gradesRef, { ...recordToSave, id: undefined });
                    recordToSave.id = docRef.id;
                } else {
                    const docRef = doc(firestoreDb, COLLECTION_NAME, record.id);
                    await setDoc(docRef, recordToSave, { merge: true });
                }
                await indexedDb.add('grades', recordToSave);
                return;
            } catch (error) {
                console.error("Firestore grades save error:", error);
            }
        }
        await indexedDb.add('grades', recordToSave);
    },

    unsubscribe: (organizationId: string): void => {
        const unsubscribe = subscriptions.get(organizationId);
        if (unsubscribe) {
            unsubscribe();
            subscriptions.delete(organizationId);
        }
    }
};
