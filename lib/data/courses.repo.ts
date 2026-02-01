
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

    getById: async (organizationId: string, id: string): Promise<Course | null> => {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return null;
            const data = snap.data();
            if (data.organizationId !== organizationId) return null;
            return { id: snap.id, ...data } as Course;
        } catch (e) {
            console.error("Failed to fetch course", id, e);
            throw e;
        }
    },

    add: async (organizationId: string, course: Course) => {
        const ref = course.id ? doc(db, COLLECTION, course.id) : doc(collection(db, COLLECTION));
        const newCourse = {
            ...course,
            id: ref.id,
            organizationId,
            createdAt: course.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newCourse);
        return newCourse;
    },

    update: async (organizationId: string, id: string, updates: Partial<Course>) => {
        const ref = doc(db, COLLECTION, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return { id: snap.id, ...snap.data() } as Course;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
