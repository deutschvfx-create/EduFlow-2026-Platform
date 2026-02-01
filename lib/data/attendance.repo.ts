import { db as indexedDb } from "@/lib/offline-db/client";
import { AttendanceRecord } from "@/lib/types/attendance";
import { db as firestoreDb } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    setDoc,
    Unsubscribe
} from "firebase/firestore";

const COLLECTION_NAME = "attendance";
const subscriptions = new Map<string, Unsubscribe>();

export const attendanceRepo = {
    getAll: async (
        organizationId: string,
        onUpdate?: (records: AttendanceRecord[]) => void,
        options?: { studentId?: string; scheduleIds?: string[] }
    ): Promise<AttendanceRecord[]> => {
        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const attendanceRef = collection(firestoreDb, COLLECTION_NAME);
                let q = query(attendanceRef, where("organizationId", "==", organizationId));

                if (options?.studentId) {
                    q = query(q, where("studentId", "==", options.studentId));
                }

                if (options?.scheduleIds && options.scheduleIds.length > 0) {
                    q = query(q, where("scheduleId", "in", options.scheduleIds.slice(0, 30)));
                }

                if (onUpdate) {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const records = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as AttendanceRecord[];
                        onUpdate(records);
                    }, (error) => {
                        console.error("Attendance listener error:", error);
                        indexedDb.getAll<AttendanceRecord>('attendance').then(all => {
                            onUpdate(all.filter(r => (r as any).organizationId === organizationId));
                        });
                    });
                    subscriptions.set(organizationId, unsubscribe);
                }

                return new Promise((resolve) => {
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const records = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as AttendanceRecord[];
                        unsubscribe();
                        resolve(records);
                    }, (error) => {
                        console.error("Attendance initial fetch error:", error);
                        unsubscribe();
                        indexedDb.getAll<AttendanceRecord>('attendance').then(all => {
                            resolve(all.filter(r => (r as any).organizationId === organizationId));
                        });
                    });
                });
            } catch (error) {
                console.error("Firestore attendance error:", error);
            }
        }

        const all = await indexedDb.getAll<AttendanceRecord>('attendance');
        return all.filter(r => (r as any).organizationId === organizationId);
    },

    save: async (organizationId: string, record: AttendanceRecord): Promise<void> => {
        // Ensure organizationId is present
        const recordToSave = {
            ...record,
            organizationId,
            updatedAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined' && firestoreDb) {
            try {
                const attendanceRef = collection(firestoreDb, COLLECTION_NAME);
                if (record.id.startsWith('new-') || !record.id) {
                    // New record
                    const docRef = await addDoc(attendanceRef, { ...recordToSave, id: undefined });
                    recordToSave.id = docRef.id;
                } else {
                    // Existing record - use setDoc with merge to ensure it exists or updates
                    const docRef = doc(firestoreDb, COLLECTION_NAME, record.id);
                    await setDoc(docRef, recordToSave, { merge: true });
                }
                await indexedDb.add('attendance', recordToSave);
                return;
            } catch (error) {
                console.error("Firestore attendance save error:", error);
            }
        }
        await indexedDb.add('attendance', recordToSave);
    },

    unsubscribe: (organizationId: string): void => {
        const unsubscribe = subscriptions.get(organizationId);
        if (unsubscribe) {
            unsubscribe();
            subscriptions.delete(organizationId);
        }
    }
};
