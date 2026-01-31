import { db } from "@/lib/offline-db/client";

export interface Grade {
    id: string;
    studentId: string;
    courseId: string;
    value: number; // or string e.g 'A', '5'
    date: string;
    type: 'HOMEWORK' | 'EXAM' | 'QUIZ';
    comment?: string;
}

const MOCK_GRADES: Grade[] = [];

export const gradesRepo = {
    getAll: async (organizationId: string): Promise<Grade[]> => {
        // Multi-tenant: filter by organizationId if needed
        return db.getAll<Grade>('grades');
    },

    add: async (grade: Grade) => {
        return db.add('grades', grade);
    }
};
