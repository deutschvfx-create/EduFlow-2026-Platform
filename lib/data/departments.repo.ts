
import { db } from "@/lib/firebase";
import { Department } from "@/lib/types/department";
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

const COLLECTION = "departments";

export const departmentsRepo = {
    getAll: async (organizationId: string): Promise<Department[]> => {
        try {
            const q = query(collection(db, COLLECTION), where("organizationId", "==", organizationId));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
        } catch (e) {
            console.error("Failed to fetch departments", e);
            throw e;
        }
    },

    getById: async (organizationId: string, id: string): Promise<Department | null> => {
        try {
            const ref = doc(db, COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as Department;
        } catch (e) {
            console.error("Failed to fetch department", id, e);
            return null;
        }
    },

    getByFaculty: async (facultyId: string): Promise<Department[]> => {
        const q = query(collection(db, COLLECTION), where("facultyId", "==", facultyId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
    },

    add: async (organizationId: string, department: Department) => {
        const ref = department.id ? doc(db, COLLECTION, department.id) : doc(collection(db, COLLECTION));
        const newDepartment = {
            ...department,
            id: ref.id,
            organizationId,
            createdAt: department.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newDepartment);
        return newDepartment;
    },

    update: async (organizationId: string, id: string, updates: Partial<Department>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Department;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
