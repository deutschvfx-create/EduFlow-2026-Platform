"use server";

import { db } from "@/lib/firebase"; // Keep for client logic if needed, but prefer Admin for some tasks
import { doc, getDoc, updateDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { emailService } from "@/lib/services/email.service";

/**
 * Atomically registers a teacher: Checks duplicates, creates Auth user, saves to Firestore, sends code.
 */
/**
 * Atomically registers a user (Student or Teacher).
 * - Checks duplicates.
 * - Creates Auth user.
 * - Saves to Firestore.
 * - Sends verification code.
 */
export async function registerUserAction(data: {
    orgId?: string,
    orgName?: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    gender: 'male' | 'female' | 'other',
    birthDate: string,
    password?: string;
    role: 'teacher' | 'student' | 'owner';
    groupId?: string; // For students
    specialization?: string; // For teachers
}) {
    try {
        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();
        if (!adminDb || !adminAuth) throw new Error("Firebase Admin not initialized");

        const usersRef = adminDb.collection("users");
        const cleanEmail = data.email.trim().toLowerCase();
        const phone = data.phone.trim();

        // 1. Check Duplicates (Global Email and Phone)
        // Note: For students/teachers without an Org, we still check global uniqueness
        if (data.orgId) {
            const phoneSnap = await usersRef.where("organizationId", "==", data.orgId).where("phone", "==", phone).get();
            if (!phoneSnap.empty) return { success: false, error: "Данный телефон уже зарегистрирован в этой организации." };

            const nameSnap = await usersRef
                .where("organizationId", "==", data.orgId)
                .where("lastName", "==", data.lastName)
                .where("firstName", "==", data.firstName)
                .where("birthDate", "==", data.birthDate)
                .get();
            if (!nameSnap.empty) return { success: false, error: "Пользователь с такими данными уже зарегистрирован в этой организации." };
        }

        // 2. Create or Get Auth User
        let userId: string;
        try {
            const userRecord = await adminAuth.createUser({
                email: cleanEmail,
                password: data.password,
                displayName: `${data.firstName} ${data.lastName}`,
            });
            userId = userRecord.uid;
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-exists' || authError.code === 'auth/email-already-in-use') {
                const existingUser = await adminAuth.getUserByEmail(cleanEmail);
                userId = existingUser.uid;
            } else {
                throw authError;
            }
        }

        // 3. Save to Firestore
        const baseData = {
            uid: userId, // Ensure consistency with UserData interface
            id: userId,
            organizationId: data.orgId || null,
            firstName: data.firstName,
            lastName: data.lastName,
            name: `${data.firstName} ${data.lastName}`,
            email: cleanEmail,
            phone: phone,
            gender: data.gender,
            birthDate: data.birthDate,
            status: data.role === 'owner' ? 'ACTIVE' : (data.role === 'student' ? 'ACTIVE' : 'SUSPENDED'), // Owner & Student active, Teacher needs approval?
            emailVerified: false,
            role: data.role,
            createdAt: Date.now(),
        };

        let roleSpecificData = {};
        if (data.role === 'teacher') {
            roleSpecificData = {
                permissions: {
                    canCreateGroups: false,
                    canManageStudents: true,
                    canMarkAttendance: true,
                    canGradeStudents: true,
                    canSendAnnouncements: false,
                    canUseChat: true,
                    canInviteStudents: false
                },
                specialization: data.specialization || ''
            };
        } else if (data.role === 'student') {
            roleSpecificData = {
                groupIds: data.groupId ? [data.groupId] : [],
                academicStatus: 'ACTIVE',
            };
        }

        await usersRef.doc(userId).set({
            ...baseData,
            ...roleSpecificData
        }, { merge: true });

        // 4. Generate 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        await adminDb.collection("email_verifications").doc(userId).set({
            code,
            email: cleanEmail,
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            createdAt: admin.firestore.Timestamp.now()
        });

        // 5. Send Email
        await emailService.sendVerificationCode(cleanEmail, code, data.orgName || "Uni Prime");

        return { success: true, userId };
    } catch (e: any) {
        console.error("registerUserAction Error:", e);
        if (e.code === 'auth/email-already-exists' || e.code === 'auth/email-already-in-use') {
            return { success: false, error: "Данный email уже занят." };
        }
        if (e.message === 'RESEND_SANDBOX_LIMIT') {
            return {
                success: false,
                error: "Ошибка Resend: В режиме тестирования письма можно отправлять только на вашу почту."
            };
        }
        return { success: false, error: e.message };
    }
}


/**
 * Checks if a user exists by email. Returns basic info if true.
 */
export async function checkUserExistsAction(email: string) {
    try {
        const adminAuth = getAdminAuth();
        if (!adminAuth) throw new Error("Admin Auth not initialized");

        const user = await adminAuth.getUserByEmail(email);
        return {
            exists: true,
            name: user.displayName,
            uid: user.uid,
            photoURL: user.photoURL
        };
    } catch (e: any) {
        if (e.code === 'auth/user-not-found') return { exists: false };
        console.error("checkUserExistsAction Error:", e);
        return { exists: false, error: e.message };
    }
}

/**
 * Adds an existing user to an organization (Creation of Membership).
 * Verifies ID Token for security.
 */
export async function joinOrganizationAction(data: {
    idToken: string;
    orgId: string;
    role: 'teacher' | 'student';
    groupId?: string;
    specialization?: string;
}) {
    try {
        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();
        if (!adminDb || !adminAuth) throw new Error("Firebase Admin not initialized");

        // 1. Verify User
        const decodedToken = await adminAuth.verifyIdToken(data.idToken);
        const uid = decodedToken.uid;

        // 2. Check if already a member
        const memRef = adminDb.collection("users").doc(uid).collection("memberships").where("organizationId", "==", data.orgId);
        const memSnap = await memRef.get();
        if (!memSnap.empty) {
            return { success: false, error: "Вы уже являетесь участником этой организации." };
        }

        // 3. Create Membership
        const membershipData = {
            userId: uid,
            organizationId: data.orgId,
            role: data.role,
            status: data.role === 'student' ? 'ACTIVE' : 'SUSPENDED',
            createdAt: new Date().toISOString(),
            ...(data.role === 'student' ? {
                groupIds: data.groupId ? [data.groupId] : [],
                academicStatus: 'ACTIVE'
            } : {
                permissions: {
                    canCreateGroups: false,
                    canManageStudents: true,
                    canMarkAttendance: true,
                    canGradeStudents: true,
                    canSendAnnouncements: false,
                    canUseChat: true,
                    canInviteStudents: false
                },
                specialization: data.specialization || ''
            })
        };

        // Add to subcollection
        await adminDb.collection("users").doc(uid).collection("memberships").add(membershipData);

        // Update 'currentOrganizationId' in main profile if not set or generic update
        await adminDb.collection("users").doc(uid).update({
            currentOrganizationId: data.orgId
        });

        return { success: true, userId: uid };

    } catch (e: any) {
        console.error("joinOrganizationAction Error:", e);
        return { success: false, error: e.message };
    }
}

/**
 * Resends a verification code.
 */
export async function resendVerificationCodeAction(email: string, orgName: string, userId: string) {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) throw new Error("Firebase Admin not initialized");

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        await adminDb.collection("email_verifications").doc(userId).set({
            code,
            email,
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            createdAt: admin.firestore.Timestamp.now()
        }, { merge: true });

        await emailService.sendVerificationCode(email, code, orgName);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Verifies the 4-digit code using Admin SDK.
 */
export async function verifyCodeAction(userId: string, enteredCode: string) {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) throw new Error("Firebase Admin not initialized");

        const verificationRef = adminDb.collection("email_verifications").doc(userId);
        const snap = await verificationRef.get();

        if (!snap.exists) {
            return { success: false, error: "Код не найден или истёк. Попробуйте отправить снова." };
        }

        const data = snap.data();
        if (!data) return { success: false, error: "Data error" };

        const now = new Date();
        if (data.expiresAt.toDate() < now) {
            await verificationRef.delete();
            return { success: false, error: "Код истёк. Пожалуйста, запросите новый код." };
        }

        if (data.code !== enteredCode) {
            return { success: false, error: "Неверный код. Проверьте ещё раз." };
        }

        // Success: Update user
        await adminDb.collection("users").doc(userId).update({
            emailVerified: true
        });

        await verificationRef.delete();
        return { success: true };
    } catch (e: any) {
        console.error("verifyCodeAction Error:", e);
        return { success: false, error: e.message };
    }
}

/**
 * Creates a teacher directly using Admin SDK (for manual add by Admin).
 * Does NOT sign out the current user.
 */
export async function createTeacherByAdminAction(data: {
    orgId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    gender: 'male' | 'female' | 'other',
    birthDate: string,
    password?: string,
    specialization: string;
    role: 'teacher' | 'curator' | 'admin';
}) {
    try {
        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();
        if (!adminDb || !adminAuth) throw new Error("Firebase Admin not initialized");

        const usersRef = adminDb.collection("users");
        const cleanEmail = data.email.trim().toLowerCase();
        const phone = data.phone.trim();

        // 1. Check Duplicates
        const phoneSnap = await usersRef.where("organizationId", "==", data.orgId).where("phone", "==", phone).get();
        if (!phoneSnap.empty) return { success: false, error: "Данный телефон уже зарегистрирован." };

        const emailSnap = await usersRef.where("organizationId", "==", data.orgId).where("email", "==", cleanEmail).get();
        if (!emailSnap.empty) return { success: false, error: "Данный email уже зарегистрирован." };

        // 2. Create Auth User
        let userId: string;
        try {
            const userRecord = await adminAuth.createUser({
                email: cleanEmail,
                password: data.password,
                displayName: `${data.firstName} ${data.lastName}`,
                emailVerified: true // Auto-verify since Admin adds them
            });
            userId = userRecord.uid;
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-exists' || authError.code === 'auth/email-already-in-use') {
                // Even if exists in Auth, we check if it exists in THIS org in step 1.
                // If we are here, it means email exists in Auth but NOT in this Org (technically possible if multi-tenant but we usually scope by org)
                // OR it's a race condition.
                // For now, let's look up the user.
                const existingUser = await adminAuth.getUserByEmail(cleanEmail);
                userId = existingUser.uid;
            } else {
                throw authError;
            }
        }

        // 3. Save to Firestore
        await usersRef.doc(userId).set({
            id: userId,
            organizationId: data.orgId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: cleanEmail,
            phone: phone,
            gender: data.gender,
            birthDate: data.birthDate,
            specialization: data.specialization,
            status: 'ACTIVE', // Admin adds = Active
            emailVerified: true,
            role: data.role,
            groupIds: [],
            createdAt: new Date().toISOString(),
            permissions: {
                canCreateGroups: data.role === 'admin',
                canManageStudents: true,
                canMarkAttendance: true,
                canGradeStudents: true,
                canSendAnnouncements: data.role === 'admin',
                canUseChat: true,
                canInviteStudents: data.role === 'admin'
            }
        }, { merge: true });

        return { success: true, userId };
    } catch (e: any) {
        console.error("createTeacherByAdminAction Error:", e);
        return { success: false, error: e.message };
    }
}
