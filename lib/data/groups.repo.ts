
import { db } from "@/lib/firebase";
import { Group } from "@/lib/types/group";
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

const COLLECTION = "groups";

export const groupsRepo = {
    getAll: async (organizationId: string, options?: { groupIds?: string[] }): Promise<Group[]> => {
        try {
            let q = query(collection(db, COLLECTION), where("organizationId", "==", organizationId));

            if (options?.groupIds && options.groupIds.length > 0) {
                // Firestore 'in' has a limit of 30
                q = query(q, where("__name__", "in", options.groupIds.slice(0, 30)));
            }

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        } catch (e) {
            console.error("Failed to fetch groups", e);
            throw e;
        }
    },

    getById: async (organizationId: string, id: string): Promise<Group | null> => {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as Group;
        } catch (e) {
            console.error("Failed to fetch group", id, e);
            return null;
        }
    },

    getByFaculty: async (facultyId: string): Promise<Group[]> => {
        const q = query(collection(db, COLLECTION), where("facultyId", "==", facultyId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    },

    add: async (organizationId: string, group: Group) => {
        const ref = group.id ? doc(db, COLLECTION, group.id) : doc(collection(db, COLLECTION));
        const newGroup = {
            ...group,
            id: ref.id,
            organizationId,
            createdAt: group.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newGroup);
        return newGroup;
    },

    update: async (organizationId: string, id: string, updates: Partial<Group>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Group;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
