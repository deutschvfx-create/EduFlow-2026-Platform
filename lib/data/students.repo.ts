
import { db } from "@/lib/firebase";
import { Student } from "@/lib/types/student";
import { MOCK_STUDENTS } from "@/lib/mock/students";
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

export const studentsRepo = {
    getAll: async (): Promise<Student[]> => {
        try {
            const q = query(collection(db, COLLECTION), where("role", "==", "STUDENT"));
            const snapshot = await getDocs(q);

            // Auto-seed if empty (Migration from mock)
            if (snapshot.empty) {
                console.log("Seeding mock students to Firestore...");
                const batch = writeBatch(db);
                const seeded: Student[] = [];

                MOCK_STUDENTS.forEach(s => {
                    const ref = doc(db, COLLECTION, s.id);
                    // Map Student to Firestore UserData properties + extra student fields
                    const userData = {
                        ...s,
                        uid: s.id,
                        role: "STUDENT",
                        organizationId: "default", // or whatever default
                    };
                    batch.set(ref, userData);
                    seeded.push(userData as unknown as Student);
                });

                await batch.commit();
                return seeded;
            }

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as unknown as Student;
            });
        } catch (e) {
            console.error("Failed to fetch students", e);
            throw e;
        }
    },

    add: async (student: Student) => {
        const ref = student.id ? doc(db, COLLECTION, student.id) : doc(collection(db, COLLECTION));
        await setDoc(ref, {
            ...student,
            role: "STUDENT",
            createdAt: new Date().toISOString()
        });
        return { ...student, id: ref.id };
    },

    update: async (id: string, updates: Partial<Student>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as unknown as Student;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
