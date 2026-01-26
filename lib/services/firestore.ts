
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type UserRole = 'OWNER' | 'DIRECTOR' | 'TEACHER' | 'STUDENT';

export interface UserData {
    uid: string;
    email: string;
    role: UserRole;
    name?: string;
    organizationId?: string;
    createdAt: number;
}

export const UserService = {
    async getUser(uid: string): Promise<UserData | null> {
        if (typeof window === 'undefined') return null;
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? (snap.data() as UserData) : null;
    },

    async createUser(uid: string, data: Omit<UserData, 'uid'>) {
        if (typeof window === 'undefined') return;
        await setDoc(doc(db, "users", uid), {
            ...data,
            uid,
            createdAt: Date.now()
        });
    },

    async updateUser(uid: string, data: Partial<UserData>) {
        if (typeof window === 'undefined') return;
        await updateDoc(doc(db, "users", uid), data);
    }
};

export const DashboardService = {
    async getStats() {
        // In a real app with many docs, use 'count' aggregation. 
        // For now/MVP, getting snapshot.size is fine or we can use aggregation features if enabled.
        // Let's stick to getCountFromServer for efficiency if available, or just getDocs for simplicity.
        // Given we might not have data yet, returning 0s is safe.

        // Note: We need to import collection and getCountFromServer/getDocs
        // To keep it simple and consistent with imports above:
        const { collection, getCountFromServer } = await import("firebase/firestore");

        try {
            const studentsColl = collection(db, "users");
            // Ideally query by role='STUDENT', but for MVP stats...
            // Let's simpler: just mocked for now or try to fetch real if collections exist.

            // We don't have separate collections for teachers/groups yet in the migration plan.
            // We only have 'users'.
            // So we need to query 'users' where role == 'STUDENT' etc.

            // This requires 'query' and 'where'
            const { query, where } = await import("firebase/firestore");

            const studentsQuery = query(collection(db, "users"), where("role", "==", "STUDENT"));
            const teachersQuery = query(collection(db, "users"), where("role", "==", "TEACHER"));
            // Groups and Subjects likely will be in "groups" and "subjects" collections later.

            const studentsSnap = await getCountFromServer(studentsQuery);
            const teachersSnap = await getCountFromServer(teachersQuery);

            return {
                students: studentsSnap.data().count,
                teachers: teachersSnap.data().count,
                groups: 0, // Not migrated yet
                subjects: 0 // Not migrated yet
            };
        } catch (e) {
            console.error("Failed to fetch stats", e);
            return { students: 0, teachers: 0, groups: 0, subjects: 0 };
        }
    }
};
