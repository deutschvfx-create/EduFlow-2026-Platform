import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    deleteDoc,
    serverTimestamp,
    DocumentData
} from "firebase/firestore";
import { db as getDb } from "../firebase";
import { Mission } from "../types/missions";

export const missionsRepo = {
    async getAll(orgId: string): Promise<Mission[]> {
        const db = getDb();
        const q = query(
            collection(db, "organizations", orgId, "missions")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() } as Mission));
    },

    async getById(orgId: string, missionId: string): Promise<Mission | null> {
        const db = getDb();
        const docRef = doc(db, "organizations", orgId, "missions", missionId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, ...snapshot.data() } as Mission;
    },

    async save(orgId: string, mission: Mission): Promise<void> {
        const db = getDb();
        const docRef = doc(db, "organizations", orgId, "missions", mission.id);
        const data = {
            ...mission,
            updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
    },

    async delete(orgId: string, missionId: string): Promise<void> {
        const db = getDb();
        const docRef = doc(db, "organizations", orgId, "missions", missionId);
        await deleteDoc(docRef);
    }
};
