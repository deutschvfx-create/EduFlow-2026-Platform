
import { db } from "@/lib/firebase";
import { Announcement } from "@/lib/types/announcement";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    writeBatch
} from "firebase/firestore";

const COLLECTION = "announcements";

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "a1",
        title: "Начало семестра",
        content: "Учеба начинается 1 сентября. Ждем всех вовремя!",
        status: 'PUBLISHED',
        authorId: 'system',
        authorName: 'Администрация',
        authorRole: 'DIRECTOR',
        targetType: 'ALL',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
    }
];

export const announcementsRepo = {
    getAll: async (): Promise<Announcement[]> => {
        try {
            const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                const batch = writeBatch(db);
                MOCK_ANNOUNCEMENTS.forEach(a => {
                    batch.set(doc(db, COLLECTION, a.id), a);
                });
                await batch.commit();
                return MOCK_ANNOUNCEMENTS;
            }

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        } catch (e) {
            console.error("Failed to fetch announcements", e);
            return [];
        }
    },

    add: async (announcement: Announcement) => {
        const ref = announcement.id ? doc(db, COLLECTION, announcement.id) : doc(collection(db, COLLECTION));
        await setDoc(ref, { ...announcement, id: ref.id });
        return { ...announcement, id: ref.id };
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
