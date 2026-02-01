
import { db } from "@/lib/firebase";
import { Group } from "@/lib/types/group";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { withFallback } from "./utils";
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
    getAll: async (organizationId: string, options?: { groupIds?: string[] }): Promise<Group[]> => {
        let filteredMock = MOCK_GROUPS_FULL.filter(g => g.organizationId === organizationId);
        if (options?.groupIds && options.groupIds.length > 0) {
            filteredMock = filteredMock.filter(g => options.groupIds!.includes(g.id));
        }

        return withFallback((async () => {
            try {
                let q = query(collection(db, COLLECTION), where("organizationId", "==", organizationId));

                if (options?.groupIds && options.groupIds.length > 0) {
                    // Firestore 'in' has a limit of 30, but for basic scoping it should suffice.
                    // If we have more, we might need a different strategy or client-side filtering.
                    q = query(q, where("__name__", "in", options.groupIds.slice(0, 30)));
                }

                const snapshot = await getDocs(q);

                // Auto-seed if empty
                if (snapshot.empty && organizationId === "org_1") {
                    console.log("Seeding mock groups to Firestore...");
                    const batch = writeBatch(db);
                    const seeded: Group[] = [];

                    filteredMock.forEach(g => {
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
        })(), filteredMock);
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
