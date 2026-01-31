
import { db } from "@/lib/firebase";
import { Course } from "@/lib/types/course";
import { withFallback } from "./utils";
// import { MOCK_COURSES } from "@/lib/mock/courses"; // If exists
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
    orderBy,
    writeBatch
} from "firebase/firestore";

const COLLECTION = "courses";

const MOCK_COURSES: Course[] = [
    {
        id: "c1",
        organizationId: "org_1",
        name: "Английский A1",
        code: "ENG-A1",
        facultyId: "f1",
        departmentId: "d1",
        status: "ACTIVE",
        level: "A1",
        teacherIds: [],
        groupIds: [],
        createdAt: new Date().toISOString()
    },
    {
        id: "c2",
        organizationId: "org_1",
        name: "Немецкий B1",
        code: "GER-B1",
        facultyId: "f1",
        departmentId: "d2",
        status: "ACTIVE",
        level: "B1",
        teacherIds: [],
        groupIds: [],
        createdAt: new Date().toISOString()
    }
];

export const coursesRepo = {
    getAll: async (organizationId: string): Promise<Course[]> => {
        const filteredMock = MOCK_COURSES.filter(c => c.organizationId === organizationId);
        return withFallback((async () => {
            try {
                const q = query(
                    collection(db, COLLECTION),
                    where("organizationId", "==", organizationId)
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty && organizationId === "org_1") {
                    const batch = writeBatch(db);
                    filteredMock.forEach(c => {
                        batch.set(doc(db, COLLECTION, c.id), c);
                    });
                    await batch.commit();
                    return filteredMock;
                }

                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            } catch (e) {
                console.error("Failed to fetch courses", e);
                return filteredMock;
            }
        })(), filteredMock);
    },

    add: async (course: Course) => {
        const ref = course.id ? doc(db, COLLECTION, course.id) : doc(collection(db, COLLECTION));
        const newCourse = { ...course, id: ref.id };
        await setDoc(ref, newCourse);
        return newCourse;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
