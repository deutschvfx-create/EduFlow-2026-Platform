import { Timestamp } from "firebase/firestore";

export interface MissionQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    timeLimitSeconds: number;
    points: number;
}

export interface Mission {
    id: string;
    organizationId: string;
    teacherId: string;
    title: string;
    description: string;
    type: 'QUIZ' | 'SPEED_FLASH';
    questions: MissionQuestion[];
    status: 'DRAFT' | 'PUBLISHED';
    createdAt: string;
    updatedAt: string;
}

export interface GameSession {
    id: string;
    missionId: string;
    studentId: string;
    organizationId: string;
    score: number;
    totalPossibleScore: number;
    answers: Array<{
        questionId: string;
        selectedOptionIndex: number;
        isCorrect: boolean;
        timeTakenMs: number;
    }>;
    completedAt: string;
}
