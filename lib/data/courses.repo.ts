
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
    orderBy,
    writeBatch
} from "firebase/firestore";

const COLLECTION = "courses";

const MOCK_COURSES: Course[] = [
    {
        id: "c1",
        name: "Английский A1",
        code: "ENG-A1",
        facultyId: "f1",
        facultyName: "Языковой центр",
        facultyCode: "LC",
        departmentId: "d1",
        departmentName: "Английский язык",
        departmentCode: "ENG",
        status: "ACTIVE",
        level: "A1",
        teacherIds: [],
        teacherNames: [],
        groupIds: [],
        groupNames: [],
        createdAt: new Date().toISOString()
    },
    {
        id: "c2",
        name: "Немецкий B1",
        code: "GER-B1",
        facultyId: "f1",
        facultyName: "Языковой центр",
        facultyCode: "LC",
        departmentId: "d2",
        departmentName: "Немецкий язык",
        departmentCode: "GER",
        status: "ACTIVE",
        level: "B1",
        teacherIds: [],
        teacherNames: [],
        groupIds: [],
        groupNames: [],
        createdAt: new Date().toISOString()
    }
];

export const coursesRepo = {
    getAll: async (): Promise<Course[]> => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION));

            if (snapshot.empty) {
                const batch = writeBatch(db);
                MOCK_COURSES.forEach(c => {
                    batch.set(doc(db, COLLECTION, c.id), c);
                });
                await batch.commit();
                return MOCK_COURSES;
            }

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        } catch (e) {
            console.error("Failed to fetch courses", e);
            return [];
        }
    },

    add: async (course: Course) => {
        const ref = course.id ? doc(db, COLLECTION, course.id) : doc(collection(db, COLLECTION));
        await setDoc(ref, { ...course, id: ref.id });
        return { ...course, id: ref.id };
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
