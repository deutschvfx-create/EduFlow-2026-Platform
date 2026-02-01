
import { db } from "@/lib/firebase";
import { Faculty } from "@/lib/types/faculty";
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

const COLLECTION = "faculties";

export const facultiesRepo = {
    getAll: async (organizationId: string): Promise<Faculty[]> => {
        try {
            const q = query(collection(db, COLLECTION), where("organizationId", "==", organizationId));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faculty));
        } catch (e) {
            console.error("Failed to fetch faculties", e);
            throw e;
        }
    },

    getById: async (organizationId: string, id: string): Promise<Faculty | null> => {
        try {
            const ref = doc(db, COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as Faculty;
        } catch (e) {
            console.error("Failed to fetch faculty", id, e);
            return null;
        }
    },

    add: async (organizationId: string, faculty: Faculty) => {
        const ref = faculty.id ? doc(db, COLLECTION, faculty.id) : doc(collection(db, COLLECTION));
        const newFaculty = {
            ...faculty,
            id: ref.id,
            organizationId,
            createdAt: faculty.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newFaculty);
        return newFaculty;
    },

    update: async (organizationId: string, id: string, updates: Partial<Faculty>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Faculty;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
