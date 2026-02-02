
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type UserRole = 'owner' | 'teacher' | 'student';

export interface UserData {
    uid: string;
    email: string;
    role: UserRole;
    name?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    photoURL?: string;
    photoScale?: number;
    photoPosition?: { x: number; y: number };
    organizationId?: string | null;
    organizationType?: string;
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
    },

    async getAllUsers(organizationId: string): Promise<UserData[]> {
        if (typeof window === 'undefined' || !db) return [];
        try {
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const q = query(collection(db, "users"), where("organizationId", "==", organizationId));
            const snap = await getDocs(q);
            return snap.docs.map(doc => doc.data() as UserData);
        } catch (e) {
            console.error("UserService.getAllUsers failed:", e);
            return [];
        }
    }
};

export const DashboardService = {
    async getStats(organizationId: string) {
        if (typeof window === 'undefined' || !db || !organizationId) {
            return { students: 0, teachers: 0, groups: 0, subjects: 0 };
        }

        try {
            const { collection, getCountFromServer, query, where } = await import("firebase/firestore");

            const studentsQuery = query(
                collection(db, "users"),
                where("role", "==", "student"),
                where("organizationId", "==", organizationId)
            );
            const teachersQuery = query(
                collection(db, "users"),
                where("role", "==", "teacher"),
                where("organizationId", "==", organizationId)
            );

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

export const OrganizationService = {
    async createOrganization(data: { name: string, type: string, ownerId: string }) {
        if (typeof window === 'undefined' || !db) return null;
        try {
            const { collection, doc, setDoc } = await import("firebase/firestore");
            const newDocRef = doc(collection(db, "organizations"));
            const orgId = newDocRef.id;

            await setDoc(newDocRef, {
                ...data,
                id: orgId,
                organizationId: orgId,
                createdAt: Date.now()
            });
            return orgId;
        } catch (e) {
            console.error("OrganizationService.createOrganization failed:", e);
            throw e;
        }
    },

    async bootstrapOrganization(uid: string, userData: UserData, orgData: { name: string, type: string }) {
        if (typeof window === 'undefined' || !db) return null;
        console.log("Starting bootstrap for UID:", uid);

        try {
            const { collection, doc, setDoc } = await import("firebase/firestore");

            // 1. Create Organization
            const orgRef = doc(collection(db, "organizations"));
            const orgId = orgRef.id;
            const organization = {
                ...orgData,
                id: orgId,
                organizationId: orgId,
                ownerId: uid,
                createdAt: Date.now()
            };

            console.log("Attempting to create organization at:", orgRef.path, organization);
            await setDoc(orgRef, organization);
            console.log("Organization created successfully:", orgId);

            // 2. Create User Profile
            const userRef = doc(db, "users", uid);
            const userUpdate = {
                ...userData,
                uid,
                organizationId: orgId,
                organizationType: orgData.type,
                createdAt: Date.now()
            };

            console.log("Attempting to create user profile at:", userRef.path, userUpdate);
            await setDoc(userRef, userUpdate);
            console.log("User profile created successfully");

            return orgId;
        } catch (e: any) {
            console.error("Bootstrap failed at some step:", e.code, e.message);
            throw e;
        }
    }
};
