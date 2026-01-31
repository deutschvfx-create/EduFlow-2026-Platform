export type ClassroomType = 'CLASSROOM' | 'LAB' | 'ONLINE' | 'OTHER';

export interface Classroom {
    id: string;
    name: string;
    type: ClassroomType;
    status: 'ACTIVE' | 'DISABLED';
    capacity?: number;
    note?: string;
    color?: string; // Hex color for calendar visualization
}
