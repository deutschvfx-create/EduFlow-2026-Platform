
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type UserRole = 'user' | 'director' | 'owner' | 'teacher' | 'student'; // 'owner' kept for backward compatibility

export interface UserData {
    uid: string;
    email: string;
    emailVerified: boolean;
    onboardingStep: 'verify-email' | 'organization' | 'complete';
    // Global Profile Data
    name?: string;
    firstName?: string; // Global First Name
    lastName?: string;  // Global Last Name
    birthDate?: string; // Global Birth Date
    gender?: 'male' | 'female' | 'other'; // Global Gender
    phone?: string;     // Global Phone
    photoURL?: string;
    photoScale?: number;
    photoPosition?: { x: number; y: number };

    // Multi-School Context
    currentOrganizationId?: string | null; // Last visited school
    // Deprecated fields (to be migrated to Membership)
    organizationId?: string | null;
    role?: UserRole;

    createdAt: number;
}

export interface Membership {
    userId: string;
    organizationId: string;
    role: UserRole;
    status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

    // Student Specific
    groupIds?: string[];
    academicStatus?: 'ACTIVE' | 'GRADUATED' | 'DROPPED';

    // Teacher Specific
    permissions?: {
        canCreateGroups: boolean;
        canManageStudents: boolean;
        canMarkAttendance: boolean;
        canGradeStudents: boolean;
        canSendAnnouncements: boolean;
        canUseChat: boolean;
        canInviteStudents: boolean;
    };
    specialization?: string;

    createdAt: string;
}

export interface JoinRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    organizationId: string;
    organizationName: string;
    role: UserRole;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message?: string;
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

    async getMemberships(uid: string): Promise<Membership[]> {
        if (typeof window === 'undefined' || !db) return [];
        try {
            const { collection, getDocs } = await import("firebase/firestore");
            const membershipsRef = collection(db, "users", uid, "memberships");
            const snap = await getDocs(membershipsRef);
            return snap.docs.map(doc => doc.data() as Membership);
        } catch (e) {
            console.error("UserService.getMemberships failed:", e);
            return [];
        }
    },

    async getAllUsers(organizationId: string): Promise<UserData[]> {
        if (typeof window === 'undefined' || !db || !organizationId) return [];
        try {
            const { collectionGroup, query, where, getDocs, doc, getDoc } = await import("firebase/firestore");

            // 1. Find all memberships for this organization
            const membershipsQuery = query(
                collectionGroup(db, "memberships"),
                where("organizationId", "==", organizationId)
            );
            const membershipSnap = await getDocs(membershipsQuery);
            const uids = membershipSnap.docs.map(d => d.data().userId).filter(Boolean);

            if (uids.length === 0) return [];

            // 2. Fetch UserData for each unique UID
            const uniqueUids = [...new Set(uids)];
            const userPromises = uniqueUids.map(uid => getDoc(doc(db, "users", uid)));
            const userSnaps = await Promise.all(userPromises);

            return userSnaps
                .filter(s => s.exists())
                .map(s => s.data() as UserData);
        } catch (e) {
            console.error("UserService.getAllUsers failed:", e);
            return [];
        }
    },

    async registerStudent(uid: string, profile: Omit<UserData, 'uid' | 'createdAt'>) {
        if (typeof window === 'undefined' || !db) return;
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, {
                ...profile,
                uid,
                role: 'student',
                createdAt: Date.now()
            });
            console.log("✅ [UserService] Student profile created for:", uid);
        } catch (e) {
            console.error("UserService.registerStudent failed:", e);
            throw e;
        }
    }
};

export const DashboardService = {
    async getStats(organizationId: string) {
        if (typeof window === 'undefined' || !db || !organizationId) {
            return { students: 0, teachers: 0, groups: 0, subjects: 0 };
        }

        try {
            const { collectionGroup, getCountFromServer, query, where } = await import("firebase/firestore");

            const studentsQuery = query(
                collectionGroup(db, "memberships"),
                where("organizationId", "==", organizationId),
                where("role", "==", "student"),
                where("status", "==", "ACTIVE")
            );
            const teachersQuery = query(
                collectionGroup(db, "memberships"),
                where("organizationId", "==", organizationId),
                where("role", "==", "teacher"),
                where("status", "==", "ACTIVE")
            );

            const [studentsSnap, teachersSnap] = await Promise.all([
                getCountFromServer(studentsQuery),
                getCountFromServer(teachersQuery)
            ]);

            return {
                students: studentsSnap.data().count,
                teachers: teachersSnap.data().count,
                groups: 0, // Groups are separate and usually already handled by orgId
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

    async createNewOrganization(uid: string, data: { name: string, type: string }) {
        if (typeof window === 'undefined' || !db) return null;
        try {
            const { collection, doc, setDoc } = await import("firebase/firestore");

            // 1. Create Organization
            const orgRef = doc(collection(db, "organizations"));
            const orgId = orgRef.id;
            await setDoc(orgRef, {
                ...data,
                id: orgId,
                organizationId: orgId,
                ownerId: uid,
                createdAt: Date.now()
            });

            // 2. Create Owner Membership
            const membershipRef = doc(db, "users", uid, "memberships", orgId);
            await setDoc(membershipRef, {
                userId: uid,
                organizationId: orgId,
                role: 'owner',
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            });

            // 3. Update User Top-Level Profile (First Org Setup)
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                role: 'director',
                organizationId: orgId,
                currentOrganizationId: orgId
            });

            return orgId;
        } catch (e) {
            console.error("OrganizationService.createNewOrganization failed:", e);
            throw e;
        }
    },

    async createOrganizationWithTransaction(uid: string, data: { name: string, type: string }) {
        if (typeof window === 'undefined' || !db) return null;
        const { runTransaction, collection, doc } = await import("firebase/firestore");

        try {
            return await runTransaction(db, async (transaction) => {
                const orgRef = doc(collection(db, "organizations"));
                const orgId = orgRef.id;

                // 1. Create Organization
                transaction.set(orgRef, {
                    ...data,
                    id: orgId,
                    organizationId: orgId,
                    ownerId: uid,
                    createdAt: Date.now()
                });

                // 2. Create Owner Membership
                const membershipRef = doc(db, "users", uid, "memberships", orgId);
                transaction.set(membershipRef, {
                    userId: uid,
                    organizationId: orgId,
                    role: 'owner',
                    status: 'ACTIVE',
                    createdAt: new Date().toISOString()
                });

                // 3. Update User Top-Level Profile
                const userRef = doc(db, "users", uid);
                transaction.update(userRef, {
                    organizationId: orgId,
                    currentOrganizationId: orgId,
                    role: 'director',
                    onboardingStep: 'complete'
                });

                return orgId;
            });
        } catch (e) {
            console.error("OrganizationService.createOrganizationWithTransaction failed:", e);
            throw e;
        }
    },

    async getOrganization(orgId: string) {
        if (typeof window === 'undefined') return null;
        if (!orgId) throw new Error("Organization ID is required");

        try {
            // Ensure db is ready, or wait a brief moment if it's during initial load
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");

            if (!db) {
                console.warn("Firestore db not initialized yet, retrying...");
                // Brief pause to allow for initialization
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const snap = await getDoc(doc(db, "organizations", orgId));
            if (!snap.exists()) {
                console.warn(`Organization ${orgId} not found`);
                return null;
            }
            return snap.data();
        } catch (e: any) {
            console.error("OrganizationService.getOrganization failed:", e);
            throw e; // Re-throw to let the caller handle the error UI
        }
    },

    async updateOrganization(orgId: string, data: any) {
        if (typeof window === 'undefined' || !db) return;
        try {
            const { updateDoc, doc } = await import("firebase/firestore");
            await updateDoc(doc(db, "organizations", orgId), data);
        } catch (e) {
            console.error("OrganizationService.updateOrganization failed:", e);
            throw e;
        }
    },

    async searchOrganizations(queryText: string) {
        if (typeof window === 'undefined' || !db || !queryText) return [];
        try {
            const { collection, query, where, getDocs, limit } = await import("firebase/firestore");
            const orgsRef = collection(db, "organizations");

            // Basic prefix search (case-sensitive unfortunately in Firestore)
            const q = query(
                orgsRef,
                where("name", ">=", queryText),
                where("name", "<=", queryText + '\uf8ff'),
                limit(10)
            );

            const snap = await getDocs(q);
            return snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                name: (doc.data() as any).name || "Школа без названия",
                type: (doc.data() as any).type || "Школа"
            }));
        } catch (e) {
            console.error("searchOrganizations failed:", e);
            return [];
        }
    },

    async sendJoinRequest(data: Omit<JoinRequest, 'id' | 'status' | 'createdAt'>) {
        if (typeof window === 'undefined' || !db) return;
        try {
            const { collection, addDoc, query, where, getDocs } = await import("firebase/firestore");

            // Prevent duplicate pending requests
            const q = query(
                collection(db, "join_requests"),
                where("userId", "==", data.userId),
                where("organizationId", "==", data.organizationId),
                where("status", "==", "PENDING")
            );
            const existing = await getDocs(q);
            if (!existing.empty) {
                console.warn("[OrganizationService] User already has a pending request for this school.");
                return;
            }

            const requestsRef = collection(db, "join_requests");
            await addDoc(requestsRef, {
                ...data,
                status: 'PENDING',
                createdAt: Date.now()
            });
        } catch (e) {
            console.error("sendJoinRequest failed:", e);
            throw e;
        }
    },

    async getPendingRequests(orgId: string) {
        if (typeof window === 'undefined' || !db) return [];
        try {
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const q = query(
                collection(db, "join_requests"),
                where("organizationId", "==", orgId),
                where("status", "==", "PENDING")
            );
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JoinRequest[];
        } catch (e) {
            console.error("getPendingRequests failed:", e);
            return [];
        }
    },

    async handleJoinRequest(requestId: string, approve: boolean) {
        if (typeof window === 'undefined' || !db) return;
        try {
            const { doc, getDoc, updateDoc, setDoc } = await import("firebase/firestore");
            const requestRef = doc(db, "join_requests", requestId);
            const requestSnap = await getDoc(requestRef);

            if (!requestSnap.exists()) return;
            const request = requestSnap.data() as JoinRequest;

            if (approve) {
                // 1. Create Membership
                const membershipRef = doc(db, "users", request.userId, "memberships", request.organizationId);
                await setDoc(membershipRef, {
                    userId: request.userId,
                    organizationId: request.organizationId,
                    role: request.role,
                    status: 'ACTIVE',
                    createdAt: new Date().toISOString()
                });

                // 2. Update Request Status
                await updateDoc(requestRef, { status: 'APPROVED' });
            } else {
                await updateDoc(requestRef, { status: 'REJECTED' });
            }
        } catch (e) {
            console.error("handleJoinRequest failed:", e);
            throw e;
        }
    }
};
