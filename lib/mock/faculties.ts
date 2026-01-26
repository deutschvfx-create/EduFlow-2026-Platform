import { Faculty } from "@/lib/types/faculty";

export const MOCK_FACULTIES: Faculty[] = [
    {
        id: "f1",
        name: "Факультет иностранных языков",
        code: "LANG",
        description: "Изучение английского, немецкого, французского и других языков.",
        status: "ACTIVE",
        headTeacherId: "t1",
        headTeacherName: "Ирина Васильева",
        departmentsCount: 3,
        groupsCount: 12,
        studentsCount: 150,
        teachersCount: 15,
        createdAt: "2020-09-01T10:00:00Z"
    },
    {
        id: "f2",
        name: "Факультет точных наук",
        code: "MATH",
        description: "Математика, физика, информатика.",
        status: "ACTIVE",
        headTeacherId: "t2",
        headTeacherName: "Олег Сидоров",
        departmentsCount: 2,
        groupsCount: 8,
        studentsCount: 95,
        teachersCount: 10,
        createdAt: "2020-09-01T10:00:00Z"
    },
    {
        id: "f3",
        name: "Факультет искусств",
        code: "ARTS",
        description: "Живопись, музыка, дизайн.",
        status: "ACTIVE",
        headTeacherId: undefined,
        headTeacherName: undefined,
        departmentsCount: 4,
        groupsCount: 6,
        studentsCount: 60,
        teachersCount: 8,
        createdAt: "2021-01-15T10:00:00Z"
    },
    {
        id: "f4",
        name: "Факультет робототехники",
        code: "ROBO",
        description: "Конструирование и программирование роботов.",
        status: "INACTIVE",
        headTeacherId: "t5",
        headTeacherName: "Сергей Петров",
        departmentsCount: 1,
        groupsCount: 2,
        studentsCount: 20,
        teachersCount: 3,
        createdAt: "2023-09-01T10:00:00Z"
    },
    {
        id: "f5",
        name: "Исторический факультет",
        code: "HIST",
        description: "История мировых цивилизаций.",
        status: "ARCHIVED",
        headTeacherId: undefined,
        headTeacherName: undefined,
        departmentsCount: 0,
        groupsCount: 0,
        studentsCount: 0,
        teachersCount: 0,
        createdAt: "2018-09-01T10:00:00Z"
    },
    {
        id: "f6",
        name: "Спортивный факультет",
        code: "SPORT",
        description: "Физическая культура и спорт.",
        status: "ACTIVE",
        departmentsCount: 2,
        groupsCount: 5,
        studentsCount: 80,
        teachersCount: 5,
        createdAt: "2022-05-20T10:00:00Z"
    }
];
