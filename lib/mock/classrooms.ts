import { Classroom } from "@/lib/types/classroom";

export const MOCK_CLASSROOMS: Classroom[] = [
    // Main Building - Ground Floor
    {
        id: "cls-1",
        name: "101",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 30,
        building: "A",
        floor: "1",
        color: "#6366f1"
    },
    {
        id: "cls-2",
        name: "102",
        type: "LAB",
        status: "ACTIVE",
        capacity: 20,
        building: "A",
        floor: "1",
        note: "Компьютерный класс",
        color: "#8b5cf6"
    },
    // Main Building - Second Floor
    {
        id: "cls-3",
        name: "201",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 25,
        building: "A",
        floor: "2",
        color: "#6366f1"
    },
    {
        id: "cls-4",
        name: "202",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 30,
        building: "A",
        floor: "2",
        color: "#6366f1"
    },
    {
        id: "cls-5",
        name: "215",
        type: "LAB",
        status: "ACTIVE",
        capacity: 15,
        building: "A",
        floor: "2",
        note: "Лаборатория химии",
        color: "#8b5cf6"
    },
    // Building B
    {
        id: "cls-6",
        name: "B-101",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 40,
        building: "B",
        floor: "1",
        color: "#6366f1"
    },
    {
        id: "cls-7",
        name: "B-201",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 35,
        building: "B",
        floor: "2",
        color: "#6366f1"
    },
    // Online
    {
        id: "cls-8",
        name: "Zoom #1",
        type: "ONLINE",
        status: "ACTIVE",
        capacity: 100,
        note: "Основная комната",
        color: "#06b6d4"
    },
    {
        id: "cls-9",
        name: "Zoom #2",
        type: "ONLINE",
        status: "ACTIVE",
        capacity: 50,
        color: "#06b6d4"
    },
    // Small school example (no building/floor)
    {
        id: "cls-10",
        name: "Кабинет 1",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 12,
        color: "#6366f1"
    },
    {
        id: "cls-11",
        name: "Кабинет 2",
        type: "CLASSROOM",
        status: "ACTIVE",
        capacity: 15,
        color: "#6366f1"
    },
];
