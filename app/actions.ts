
'use server';

import { revalidatePath } from "next/cache";
import * as jwt from 'jsonwebtoken';
// import { prisma } from "@/lib/prisma"; // Removed
// import { auth } from "@/auth"; // Not needed if we don't check session in mock

// Default Configuration
const DEFAULT_CONFIG = {
    teachers: true,
    faculties: true, // Default to full university for dev
    departments: true,
    groups: true,
    courses: true,
    schedule: true,
    attendance: true,
    grades: true,
    announcements: true,
    chat: true,
    reports: true
};

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getModulesConfig(organizationId?: string) {
    if (!organizationId || !db) return DEFAULT_CONFIG;
    try {
        const orgRef = doc(db, "organizations", organizationId);
        const snap = await getDoc(orgRef);
        if (snap.exists()) {
            const data = snap.data();
            return { ...DEFAULT_CONFIG, ...(data.modules || {}) };
        }
    } catch (e) {
        console.error("Failed to fetch modules config:", e);
    }
    return DEFAULT_CONFIG;
}

export async function updateModulesConfig(organizationId: string, config: any) {
    if (!organizationId || !db) return;
    try {
        const orgRef = doc(db, "organizations", organizationId);
        await updateDoc(orgRef, {
            modules: config
        });
        revalidatePath('/app');
    } catch (e) {
        console.error("Failed to update modules config:", e);
    }
}

const SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function createDemoSession() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error("Demo mode only available in development");
    }

    const email = "demo@director.com";
    const name = "Demo Director";
    const role = "OWNER";
    const id = "demo-director-id";
    const organizationId = "demo-university-id";

    // 2. Generate Token (Simulating backend)
    const token = jwt.sign(
        { id, role, orgId: organizationId },
        SECRET,
        { expiresIn: '1h' }
    );

    // 3. Return data for client localStorage
    return {
        token,
        user: {
            id,
            name,
            role,
            email
        }
    };
}

export async function setOrganizationType(type: string) {
    // Mock action
    console.log("Setting org type:", type);
    return { success: true };
}
