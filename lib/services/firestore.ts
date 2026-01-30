
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
        if (typeof window === 'undefined' || !db) return null;
        try {
            const snap = await getDoc(doc(db, "users", uid));
            return snap.exists() ? (snap.data() as UserData) : null;
        } catch (e) {
            console.error("UserService.getUser failed:", e);
            return null;
        }
    },

    async createUser(uid: string, data: Omit<UserData, 'uid'>) {
        if (typeof window === 'undefined' || !db) return;
        try {
            await setDoc(doc(db, "users", uid), {
                ...data,
                uid,
                createdAt: Date.now()
            });
        } catch (e) {
            console.error("UserService.createUser failed:", e);
        }
    },

    async updateUser(uid: string, data: Partial<UserData>) {
        if (typeof window === 'undefined' || !db) return;
        try {
            await updateDoc(doc(db, "users", uid), data);
        } catch (e) {
            console.error("UserService.updateUser failed:", e);
        }
    }
};

export const DashboardService = {
    async getStats() {
        if (typeof window === 'undefined' || !db) {
            return { students: 0, teachers: 0, groups: 0, subjects: 0 };
        }

        try {
            const { collection, getCountFromServer, query, where } = await import("firebase/firestore");

            const studentsQuery = query(collection(db, "users"), where("role", "==", "STUDENT"));
            const teachersQuery = query(collection(db, "users"), where("role", "==", "TEACHER"));

            const [studentsSnap, teachersSnap] = await Promise.all([
                getCountFromServer(studentsQuery),
                getCountFromServer(teachersQuery)
            ]);

            return {
                students: studentsSnap.data().count,
                teachers: teachersSnap.data().count,
                groups: 0,
                subjects: 0
            };
        } catch (e) {
            console.error("Failed to fetch stats", e);
            return { students: 0, teachers: 0, groups: 0, subjects: 0 };
        }
    }
};
