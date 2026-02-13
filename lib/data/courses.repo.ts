
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

    add: async (organizationId: string, course: Partial<Course>) => {
        const ref = course.id ? doc(db, COLLECTION, course.id) : doc(collection(db, COLLECTION));
        const newCourse: Course = {
            id: ref.id,
            organizationId,
            version: course.version || "v2026",
            name: course.name || "",
            code: course.code || "",
            status: course.status || "ACTIVE",
            type: course.type || "MANDATORY",
            facultyId: course.facultyId || "none",
            departmentId: course.departmentId || "none",
            level: course.level,
            workload: course.workload || {
                hoursPerWeek: 0,
                hoursPerSemester: 0,
                hoursPerYear: 0
            },
            description: course.description,
            objective: course.objective,
            modules: course.modules || [],
            teachers: course.teachers || [],
            teacherIds: course.teacherIds || [],
            groupIds: course.groupIds || [],
            grading: course.grading || {
                type: "5_POINT",
                rounding: "NEAREST",
                minPassScore: 3,
                weights: {
                    exams: 40,
                    control: 30,
                    homework: 20,
                    participation: 10
                }
            },
            materials: course.materials || [],
            events: course.events || [],
            basePrice: course.basePrice || 0,
            currency: course.currency || 'RUB',
            archiveInfo: course.archiveInfo || undefined,
            ...course,
            format: course.format || "OFFLINE",
            grouping: course.grouping || "GROUP",
            createdAt: new Date().toISOString()
        };
        // Remove undefined fields to avoid Firestore errors
        Object.keys(newCourse).forEach(key => newCourse[key as keyof Course] === undefined && delete newCourse[key as keyof Course]);

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
