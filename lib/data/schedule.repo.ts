import { db } from "@/lib/offline-db/client";

export interface ScheduleItem {
    id: string;
    courseId: string;
    groupId: string;
    teacherId: string;
    dayOfWeek: number; // 1 = Monday
    startTime: string; // HH:mm
    endTime: string;
    room?: string;
}

const MOCK_SCHEDULE: ScheduleItem[] = [];

export const scheduleRepo = {
    getAll: async (organizationId: string): Promise<ScheduleItem[]> => {
        // Multi-tenant: filter by organizationId if needed
        await db.seedIfEmpty('schedule', MOCK_SCHEDULE);
        const all = await db.getAll<ScheduleItem>('schedule');
        // For now, assume all items in local storage are for the current org or filter if property exists
        return all;
    },

    add: async (item: ScheduleItem) => {
        return db.add('schedule', item);
    },

    delete: async (id: string) => {
        return db.delete('schedule', id);
    }
};
