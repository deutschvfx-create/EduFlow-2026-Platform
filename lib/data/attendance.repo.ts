import { db } from "@/lib/offline-db/client";

export interface AttendanceRecord {
    id: string;
    scheduleId: string;
    studentId: string;
    date: string; // ISO date
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

const MOCK_ATTENDANCE: AttendanceRecord[] = [];

export const attendanceRepo = {
    getAll: async (organizationId: string): Promise<AttendanceRecord[]> => {
        // Multi-tenant: filter by organizationId if needed
        return db.getAll<AttendanceRecord>('attendance');
    },

    add: async (record: AttendanceRecord) => {
        return db.add('attendance', record);
    },

    update: async (id: string, partial: Partial<AttendanceRecord>) => {
        const current = await db.getById<AttendanceRecord>('attendance', id);
        if (!current) return undefined;
        const updated = { ...current, ...partial };
        await db.update('attendance', updated);
        return updated;
    }
};
