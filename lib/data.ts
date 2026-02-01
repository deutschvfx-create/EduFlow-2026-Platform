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

export const CURRENT_STUDENT_ID = "student-1";

export const MOCK_STUDENTS: Student[] = [
    {
        id: "student-1",
        name: "Alex Johnson",
        email: "student@example.com",
        level: "B2",
        xp: 2450,
        streak: 12,
        avatar: "AJ",
        paymentStatus: "active",
        lastActive: "2024-03-24T10:00:00Z",
        courses: [
            {
                courseId: "c1",
                title: "Advanced English",
                totalLessons: 40,
                completedLessons: 28,
                nextLesson: "Unit 29: Advanced Conditionals",
                image: "from-indigo-500 to-purple-500",
                category: "General",
            },
            {
                courseId: "c2",
                title: "Business Communication",
                totalLessons: 20,
                completedLessons: 5,
                nextLesson: "Unit 6: Email Etiquette",
                image: "from-blue-500 to-cyan-500",
                category: "Business",
            },
        ],
    },
    {
        id: "student-2",
        name: "Maria Garcia",
        email: "maria@example.com",
        level: "C1",
        xp: 3100,
        streak: 45,
        avatar: "MG",
        paymentStatus: "overdue",
        lastActive: "2024-03-20T14:30:00Z",
        courses: [],
    },
    {
        id: "student-3",
        name: "Dmitry Ivanov",
        email: "dmitry@example.com",
        level: "A2",
        xp: 800,
        streak: 3,
        avatar: "DI",
        paymentStatus: "active",
        lastActive: "2024-03-25T09:15:00Z",
        courses: [],
    },
    {
        id: "student-4",
        name: "Sophie Dubois",
        email: "sophie@example.com",
        level: "B1",
        xp: 1500,
        streak: 10,
        avatar: "SD",
        paymentStatus: "inactive",
        lastActive: "2024-03-10T11:00:00Z",
        courses: [],
    },
    {
        id: "student-5",
        name: "Hans Muller",
        email: "hans@example.com",
        level: "B2",
        xp: 2100,
        streak: 20,
        avatar: "HM",
        paymentStatus: "active",
        lastActive: "2024-03-23T16:45:00Z",
        courses: [],
    },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "t1", date: "2024-03-20", description: "Monthly Subscription - Premium", amount: 49.99, status: "completed", studentId: "student-1" },
    { id: "t2", date: "2024-03-19", description: "Course Pack: Business English", amount: 120.00, status: "completed", studentId: "student-2" },
    { id: "t3", date: "2024-03-18", description: "Private Tutoring Session", amount: 35.00, status: "pending", studentId: "student-3" },
    { id: "t4", date: "2024-03-17", description: "Monthly Subscription - Basic", amount: 29.99, status: "completed", studentId: "student-4" },
    { id: "t5", date: "2024-03-15", description: "Exam Prep Materials", amount: 15.00, status: "failed", studentId: "student-5" },
];

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

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { studentId: "student-1", status: "present", date: "2024-03-25" },
    { studentId: "student-2", status: "late", date: "2024-03-25" },
    { studentId: "student-3", status: "sick", date: "2024-03-25" },
    { studentId: "student-4", status: "present", date: "2024-03-25" },
    { studentId: "student-5", status: "absent", date: "2024-03-25" },
];
