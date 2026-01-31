export type ClassroomType = 'CLASSROOM' | 'LAB' | 'ONLINE' | 'OTHER';

export interface Classroom {
    id: string;
    organizationId: string; // Multi-tenant: classroom belongs to organization
    name: string;
    type: ClassroomType;
    status: 'ACTIVE' | 'DISABLED';
    capacity?: number;
    note?: string;
    color?: string; // Hex color for calendar visualization
    building?: string; // Optional: Корпус / Блок
    floor?: string; // Optional: Этаж (can be string like "1", "2", "Подвал", etc.)
}
