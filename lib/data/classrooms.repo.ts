
import { db } from "@/lib/firebase";
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

const COLLECTION = "classrooms";

export interface Classroom {
    id: string;
    organizationId: string;
    name: string;
    type: 'PHYSICAL' | 'ONLINE' | 'LAB';
    capacity?: number;
    building?: string;
    floor?: string;
    status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
    createdAt: string;
}

export const classroomsRepo = {
    getAll: async (organizationId: string): Promise<Classroom[]> => {
        try {
            const q = query(collection(db, COLLECTION), where("organizationId", "==", organizationId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Classroom));
        } catch (e) {
            console.error("Failed to fetch classrooms", e);
            throw e;
        }
    },

    getById: async (id: string): Promise<Classroom | undefined> => {
        const snap = await getDoc(doc(db, COLLECTION, id));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Classroom) : undefined;
    },

    add: async (classroom: Classroom) => {
        const ref = classroom.id ? doc(db, COLLECTION, classroom.id) : doc(collection(db, COLLECTION));
        const newClassroom = {
            ...classroom,
            id: ref.id,
            createdAt: classroom.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newClassroom);
        return newClassroom as Classroom;
    },

    update: async (id: string, updates: Partial<Classroom>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Classroom;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
