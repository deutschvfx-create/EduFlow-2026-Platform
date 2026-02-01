
import { db } from "@/lib/firebase";
import { Student } from "@/lib/types/student";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where
} from "firebase/firestore";

const COLLECTION = "users";

export const studentsRepo = {
    getAll: async (organizationId: string, options?: { groupIds?: string[] }): Promise<Student[]> => {
        try {
            const collRef = collection(db, COLLECTION);
            let q = query(
                collRef,
                where("role", "==", "STUDENT"),
                where("organizationId", "==", organizationId)
            );

            if (options?.groupIds && options.groupIds.length > 0) {
                // Firestore 'array-contains-any' limit is 10
                q = query(q, where("groupIds", "array-contains-any", options.groupIds.slice(0, 10)));
            }

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as unknown as Student;
            });
        } catch (e) {
            console.error("Failed to fetch students", e);
            throw e;
        }
    },

    getById: async (organizationId: string, id: string): Promise<Student | null> => {
        try {
            const ref = doc(db, COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as unknown as Student;
        } catch (e) {
            console.error("Failed to fetch student", id, e);
            return null;
        }
    },

    add: async (organizationId: string, student: Student) => {
        const ref = student.id ? doc(db, COLLECTION, student.id) : doc(collection(db, COLLECTION));
        const newStudent = {
            ...student,
            id: ref.id,
            organizationId,
            role: "STUDENT",
            createdAt: student.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newStudent);
        return newStudent;
    },

    update: async (organizationId: string, id: string, updates: Partial<Student>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as unknown as Student;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
