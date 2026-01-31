
import { db } from "@/lib/firebase";
import { Faculty } from "@/lib/types/faculty";
import { MOCK_FACULTIES } from "@/lib/mock/faculties";
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

const COLLECTION = "faculties";

export const facultiesRepo = {
    getAll: async (organizationId: string): Promise<Faculty[]> => {
        const filteredMock = MOCK_FACULTIES.filter(f => f.organizationId === organizationId);
        return withFallback((async () => {
            try {
                const q = query(collection(db, COLLECTION), where("organizationId", "==", organizationId));
                const snapshot = await getDocs(q);

                // Auto-seed if empty (Only if using org_1 for now to represent first user)
                if (snapshot.empty && organizationId === "org_1") {
                    console.log("Seeding mock faculties to Firestore...");
                    const batch = writeBatch(db);
                    const seeded: Faculty[] = [];

                    filteredMock.forEach(f => {
                        const ref = doc(db, COLLECTION, f.id);
                        batch.set(ref, f);
                        seeded.push(f);
                    });

                    await batch.commit();
                    return seeded;
                }

                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faculty));
            } catch (e) {
                console.error("Failed to fetch faculties", e);
                throw e;
            }
        })(), filteredMock);
    },

    getById: async (id: string): Promise<Faculty | undefined> => {
        const snap = await getDoc(doc(db, COLLECTION, id));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Faculty) : undefined;
    },

    add: async (faculty: Faculty) => {
        const ref = faculty.id ? doc(db, COLLECTION, faculty.id) : doc(collection(db, COLLECTION));
        const newFaculty = { ...faculty, createdAt: new Date().toISOString() };
        await setDoc(ref, newFaculty);
        return { ...newFaculty, id: ref.id };
    },

    update: async (id: string, updates: Partial<Faculty>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Faculty;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
