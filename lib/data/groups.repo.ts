
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
        if (!organizationId) throw new Error("organizationId is required");
        try {
            const collRef = collection(db, COLLECTION);
            let q = query(
                collRef,
                where("organizationId", "==", organizationId)
            );

            if (options?.groupIds && options.groupIds.length > 0) {
                // Firestore 'in' operator limit is 30
                q = query(q, where("__name__", "in", options.groupIds.slice(0, 30)));
            }

            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as unknown as Group;
            });
        } catch (e) {
            console.error("Failed to fetch groups", e);
            throw e;
        }
    },

    getById: async (organizationId: string, id: string): Promise<Group | null> => {
        if (!organizationId) throw new Error("organizationId is required");
        try {
            const ref = doc(db, COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as unknown as Group;
        } catch (e) {
            console.error("Failed to fetch group", id, e);
            return null;
        }
    },

    add: async (organizationId: string, group: Group) => {
        if (!organizationId) throw new Error("organizationId is required");
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
        if (!organizationId) throw new Error("organizationId is required");
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as unknown as Group;
    },

    delete: async (organizationId: string, id: string) => {
        if (!organizationId) throw new Error("organizationId is required");
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
