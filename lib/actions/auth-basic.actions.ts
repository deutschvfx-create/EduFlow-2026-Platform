"use server";

import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import admin from "firebase-admin";

/**
 * NEW: Basic registration - email + password only
 * Creates user with role='user' and organizationId=null
 * No email verification, no profile data required
 */
export async function registerBasicUserAction(data: {
    email: string;
    password: string;
}) {
    try {
        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();
        if (!adminDb || !adminAuth) throw new Error("Firebase Admin not initialized");

        const cleanEmail = data.email.trim().toLowerCase();

        // 1. Create Firebase Auth user
        let userId: string;
        try {
            const userRecord = await adminAuth.createUser({
                email: cleanEmail,
                password: data.password,
                emailVerified: false,
            });
            userId = userRecord.uid;
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-exists') {
                return { success: false, error: "Этот email уже зарегистрирован." };
            }
            throw authError;
        }

        // 2. Create Firestore user document with minimal data
        await adminDb.collection("users").doc(userId).set({
            uid: userId,
            email: cleanEmail,
            role: 'user', // Default role
            organizationId: null, // No organization yet
            emailVerified: false,
            createdAt: Date.now(),
        });

        return { success: true, userId };
    } catch (e: any) {
        console.error("registerBasicUserAction Error:", e);
        return { success: false, error: e.message || "Ошибка при регистрации." };
    }
}

/**
 * NEW: Assign director role after organization creation
 * Updates user.role = 'director' and user.organizationId = orgId
 */
export async function assignDirectorRoleAction(data: {
    userId: string;
    organizationId: string;
}) {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) throw new Error("Firebase Admin not initialized");

        const userRef = adminDb.collection("users").doc(data.userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return { success: false, error: "Пользователь не найден." };
        }

        const userData = userSnap.data();

        // Prevent changing organizationId if already set
        if (userData?.organizationId && userData.organizationId !== data.organizationId) {
            return { success: false, error: "Пользователь уже привязан к другой организации." };
        }

        await userRef.update({
            role: 'director',
            organizationId: data.organizationId,
        });

        return { success: true };
    } catch (e: any) {
        console.error("assignDirectorRoleAction Error:", e);
        return { success: false, error: e.message };
    }
}

/**
 * NEW: Assign role via invite code
 * Validates invite, assigns role and organizationId from invite
 */
export async function assignRoleViaInviteAction(data: {
    userId: string;
    inviteCode: string;
}) {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) throw new Error("Firebase Admin not initialized");

        // 1. Find invite by code
        const invitesRef = adminDb.collection("invites");
        const inviteSnap = await invitesRef.where("code", "==", data.inviteCode).limit(1).get();

        if (inviteSnap.empty) {
            return { success: false, error: "Неверный код приглашения." };
        }

        const inviteDoc = inviteSnap.docs[0];
        const invite = inviteDoc.data();

        // 2. Validate invite
        if (invite.status !== 'ACTIVE') {
            return { success: false, error: "Код приглашения недействителен." };
        }

        if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
            return { success: false, error: "Код приглашения истёк." };
        }

        // 3. Update user
        const userRef = adminDb.collection("users").doc(data.userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return { success: false, error: "Пользователь не найден." };
        }

        const userData = userSnap.data();

        // Prevent changing organizationId if already set
        if (userData?.organizationId && userData.organizationId !== invite.organizationId) {
            return { success: false, error: "Вы уже состоите в другой организации." };
        }

        await userRef.update({
            role: invite.role, // 'teacher' or 'student' from invite
            organizationId: invite.organizationId,
        });

        // 4. Mark invite as used (optional)
        await inviteDoc.ref.update({
            usedBy: data.userId,
            usedAt: admin.firestore.Timestamp.now(),
        });

        return { success: true, role: invite.role, organizationId: invite.organizationId };
    } catch (e: any) {
        console.error("assignRoleViaInviteAction Error:", e);
        return { success: false, error: e.message };
    }
}
