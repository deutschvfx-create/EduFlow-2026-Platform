
import { db } from "@/lib/firebase"; // Using Client SDK
import { Teacher } from "@/lib/types/teacher";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
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

const COLLECTION = "users";

export const teachersRepo = {
    getAll: async (): Promise<Teacher[]> => {
        return withFallback((async () => {
            try {
                const q = query(collection(db, COLLECTION), where("role", "==", "TEACHER"));
                const snapshot = await getDocs(q);

                // Auto-seed if empty
                if (snapshot.empty) {
                    console.log("Seeding mock teachers to Firestore...");
                    const batch = writeBatch(db);
                    const seeded: Teacher[] = [];

                    MOCK_TEACHERS.forEach(t => {
                        const ref = doc(db, COLLECTION, t.id);
                        // Map Teacher to Firestore UserData + extra fields
                        const userData = {
                            ...t,
                            uid: t.id, // Ensure uid matches id
                            role: "TEACHER",
                            organizationId: "default", // or null
                        };
                        batch.set(ref, userData);
                        seeded.push(userData as unknown as Teacher);
                    });

                    await batch.commit();
                    return seeded;
                }

                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Map back to Teacher type if necessary, or just cast if structure matches
                    return {
                        id: doc.id,
                        ...data
                    } as unknown as Teacher;
                });
            } catch (e) {
                console.error("Failed to fetch teachers", e);
                throw e;
            }
        })(), MOCK_TEACHERS);
    },

    add: async (teacher: Teacher) => {
        // Teacher ID is usually generated, but if provided use it, else generate
        const ref = teacher.id ? doc(db, COLLECTION, teacher.id) : doc(collection(db, COLLECTION));
        await setDoc(ref, {
            ...teacher,
            role: "TEACHER",
            createdAt: new Date().toISOString()
        });
        return { ...teacher, id: ref.id };
    },

    update: async (id: string, updates: Partial<Teacher>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        // Return updated object (fetching it again to be sure, or merge)
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as unknown as Teacher;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
