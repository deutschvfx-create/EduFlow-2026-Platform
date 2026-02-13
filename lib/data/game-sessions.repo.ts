import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from "firebase/firestore";
import { db as getDb } from "../firebase";
import { GameSession } from "../types/missions";

export const gameSessionsRepo = {
    async save(orgId: string, session: GameSession): Promise<void> {
        const db = getDb();
        const docRef = doc(db, "organizations", orgId, "game_sessions", session.id);
        await setDoc(docRef, {
            ...session,
            completedAt: new Date().toISOString()
        });
    },

    async getStudentHistory(orgId: string, studentId: string): Promise<GameSession[]> {
        const db = getDb();
        const q = query(
            collection(db, "organizations", orgId, "game_sessions"),
            where("studentId", "==", studentId),
            orderBy("completedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameSession));
    },

    listenToLeaderboard(orgId: string, missionId: string, callback: (sessions: GameSession[]) => void) {
        const db = getDb();
        const q = query(
            collection(db, "organizations", orgId, "game_sessions"),
            where("missionId", "==", missionId),
            orderBy("score", "desc"),
            limit(10)
        );

        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameSession));
            callback(sessions);
        });
    }
};
