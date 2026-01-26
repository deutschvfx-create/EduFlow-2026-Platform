import { Announcement } from "@/lib/types/announcement";

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "a1",
        title: "Добро пожаловать в новый учебный семестр!",
        content: "Уважаемые студенты и преподаватели! Рады приветствовать вас в осеннем семестре 2025 года. Расписание уже доступно в личном кабинете. Желаем успехов в учебе!",
        status: "PUBLISHED",
        authorId: "u1",
        authorName: "Анна Петрова",
        authorRole: "DIRECTOR",
        targetType: "ALL",
        createdAt: "2025-08-25T10:00:00Z",
        publishedAt: "2025-08-28T09:00:00Z"
    },
    {
        id: "a2",
        title: "Изменения в расписании группы English A1",
        content: "Внимание! Занятие в пятницу переносится на субботу 14:00 в связи с болезнью преподавателя.",
        status: "PUBLISHED",
        authorId: "t1",
        authorName: "Ирина Васильева",
        authorRole: "TEACHER",
        targetType: "GROUP",
        targetId: "g1",
        targetName: "English A1",
        createdAt: "2025-09-05T14:30:00Z",
        publishedAt: "2025-09-05T14:35:00Z"
    },
    {
        id: "a3",
        title: "Подготовка к экзаменам",
        content: "Напоминаем, что промежуточные экзамены начнутся через 2 недели. Просьба сдать все домашние задания.",
        status: "DRAFT",
        authorId: "t2",
        authorName: "Олег Сидоров",
        authorRole: "TEACHER",
        targetType: "DEPARTMENT",
        targetId: "dep1", // Math dept
        targetName: "Кафедра Математики",
        createdAt: "2025-09-10T11:00:00Z"
    },
    {
        id: "a4",
        title: "Технические работы на сервере",
        content: "Сайт будет недоступен 20 сентября с 03:00 до 05:00 утра.",
        status: "ARCHIVED",
        authorId: "u1",
        authorName: "Анна Петрова",
        authorRole: "DIRECTOR",
        targetType: "ALL",
        createdAt: "2025-09-15T09:00:00Z",
        publishedAt: "2025-09-15T12:00:00Z"
    },
    {
        id: "a5",
        title: "Конкурс талантов",
        content: "Приглашаем всех желающих принять участие в ежегодном конкурсе талантов школы. Регистрация открыта до конца месяца.",
        status: "PUBLISHED",
        authorId: "u1",
        authorName: "Анна Петрова",
        authorRole: "DIRECTOR",
        targetType: "ALL",
        createdAt: "2025-09-20T16:00:00Z",
        publishedAt: "2025-09-21T10:00:00Z"
    }
];
