"use server"

import { getAdminDb } from "@/lib/firebase-admin";
import { headers } from "next/headers";

const MASTER_UID = process.env.MASTER_ADMIN_UID;

export async function exportPlatformData(userUid: string) {
    if (!MASTER_UID) {
        console.error("MASTER_ADMIN_UID not configured in .env");
        throw new Error("Системная ошибка: Скрипт не настроен.");
    }

    if (userUid !== MASTER_UID) {
        throw new Error("Доступ запрещен. Только владелец платформы может выполнять это действие.");
    }

    const db = getAdminDb();
    if (!db) throw new Error("Database not initialized");

    const collections = [
        "organizations",
        "users",
        "students",
        "teachers",
        "groups",
        "courses",
        "faculties",
        "departments",
        "schedule",
        "attendance",
        "grades",
        "announcements",
        "chat_messages"
    ];

    const exportData: Record<string, any[]> = {};

    for (const colName of collections) {
        try {
            const snapshot = await db.collection(colName).get();
            exportData[colName] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`Error exporting ${colName}:`, error);
            exportData[colName] = [];
        }
    }

    return {
        timestamp: new Date().toISOString(),
        version: "EduFlow V5 Master Export",
        data: exportData
    };
}
