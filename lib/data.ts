export type OrganizationType = 'LanguageSchool' | 'University' | 'School';

export const APP_CONFIG = {
    orgType: 'LanguageSchool' as OrganizationType, // Default
};

export interface Student {
    id: string;
    name: string;
    email: string;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    xp: number;
    streak: number;
    avatar: string;
    courses: CourseProgress[];
    paymentStatus: "active" | "inactive" | "overdue";
    lastActive: string; // ISO Date
}

export interface CourseProgress {
    courseId: string;
    title: string;
    totalLessons: number;
    completedLessons: number;
    nextLesson: string;
    image: string; // URL or placeholder color
    category: "General" | "Business" | "Exam Prep";
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: "completed" | "pending" | "failed";
    studentId: string;
}

export const RESOURCES_CATEGORIES = [
    { title: "Грамматика", count: 42, icon: "BookOpen", color: "text-pink-400" },
    { title: "Разговорный клуб", count: 12, icon: "MessageCircle", color: "text-emerald-400" },
    { title: "Аудирование", count: 28, icon: "Headphones", color: "text-sky-400" },
    { title: "Чтение", count: 35, icon: "FileText", color: "text-amber-400" },
];

export interface AttendanceRecord {
    studentId: string;
    status: "present" | "absent" | "late" | "sick";
    date: string;
}
