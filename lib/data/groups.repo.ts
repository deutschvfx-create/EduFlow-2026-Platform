
import { db } from "@/lib/firebase";
import { Group } from "@/lib/types/group";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    writeBatch
} from "firebase/firestore";

const COLLECTION = "groups";

export const groupsRepo = {
    getAll: async (): Promise<Group[]> => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION));

            // Auto-seed if empty
            if (snapshot.empty) {
                console.log("Seeding mock groups to Firestore...");
                const batch = writeBatch(db);
                const seeded: Group[] = [];

                MOCK_GROUPS_FULL.forEach(g => {
                    const ref = doc(db, COLLECTION, g.id);
                    batch.set(ref, g);
                    seeded.push(g);
                });

                await batch.commit();
                return seeded;
            }

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        } catch (e) {
            console.error("Failed to fetch groups", e);
            throw e;
        }
    },

    getById: async (id: string): Promise<Group | undefined> => {
        const snap = await getDoc(doc(db, COLLECTION, id));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Group) : undefined;
    },

    getByFaculty: async (facultyId: string): Promise<Group[]> => {
        const q = query(collection(db, COLLECTION), where("facultyId", "==", facultyId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    },

    add: async (group: Group) => {
        const ref = group.id ? doc(db, COLLECTION, group.id) : doc(collection(db, COLLECTION));
        const newGroup = { ...group, createdAt: new Date().toISOString() };
        await setDoc(ref, newGroup);
        return { ...newGroup, id: ref.id };
    },

    update: async (id: string, updates: Partial<Group>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Group;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
