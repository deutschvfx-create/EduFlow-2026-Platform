export type ModuleKey =
    | "students"
    | "teachers"
    | "faculties"
    | "departments"
    | "groups"
    | "courses"
    | "schedule"
    | "attendance"
    | "grades"
    | "announcements"
    | "chat"
    | "reports";

export type ModulesState = Record<ModuleKey, boolean>;

export const defaultModulesState: ModulesState = {
    students: true,
    teachers: true,
    faculties: true,
    departments: true,
    groups: true,
    courses: true,
    schedule: true,
    attendance: true,
    grades: true,
    announcements: true,
    chat: true,
    reports: true,
};
