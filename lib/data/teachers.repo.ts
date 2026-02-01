
import { db } from "@/lib/firebase";
import { Teacher } from "@/lib/types/teacher";
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

export const teachersRepo = {
    getAll: async (organizationId: string): Promise<Teacher[]> => {
        try {
            const q = query(
                collection(db, COLLECTION),
                where("role", "==", "TEACHER"),
                where("organizationId", "==", organizationId)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as unknown as Teacher;
            });
        } catch (e) {
            console.error("Failed to fetch teachers", e);
            throw e;
        }
    },

    getById: async (organizationId: string, id: string): Promise<Teacher | null> => {
        try {
            const ref = doc(db, COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as unknown as Teacher;
        } catch (e) {
            console.error("Failed to fetch teacher", id, e);
            return null;
        }
    },

    add: async (organizationId: string, teacher: Teacher) => {
        const ref = teacher.id ? doc(db, COLLECTION, teacher.id) : doc(collection(db, COLLECTION));
        const newTeacher = {
            ...teacher,
            id: ref.id,
            organizationId,
            role: "TEACHER",
            createdAt: teacher.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newTeacher);
        return newTeacher;
    },

    update: async (organizationId: string, id: string, updates: Partial<Teacher>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as unknown as Teacher;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
