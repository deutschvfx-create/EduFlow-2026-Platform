
import { db } from "@/lib/firebase";
import { Course } from "@/lib/types/course";
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

const COLLECTION = "courses";

export const coursesRepo = {
    getAll: async (organizationId: string): Promise<Course[]> => {
        try {
            const q = query(
                collection(db, COLLECTION),
                where("organizationId", "==", organizationId)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        } catch (e) {
            console.error("Failed to fetch courses", e);
            throw e;
        }
    },

    getById: async (id: string): Promise<Course | undefined> => {
        const snap = await getDoc(doc(db, COLLECTION, id));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : undefined;
    },

    add: async (course: Course) => {
        const ref = course.id ? doc(db, COLLECTION, course.id) : doc(collection(db, COLLECTION));
        const newCourse = {
            ...course,
            id: ref.id,
            createdAt: course.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newCourse);
        return newCourse;
    },

    update: async (id: string, updates: Partial<Course>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Course;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
