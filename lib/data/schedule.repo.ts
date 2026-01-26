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
    getAll: async (): Promise<ScheduleItem[]> => {
        await db.seedIfEmpty('schedule', MOCK_SCHEDULE);
        return db.getAll<ScheduleItem>('schedule');
    },

    add: async (item: ScheduleItem) => {
        return db.add('schedule', item);
    },

    delete: async (id: string) => {
        return db.delete('schedule', id);
    }
};
