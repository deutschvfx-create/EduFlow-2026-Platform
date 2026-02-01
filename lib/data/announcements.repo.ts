
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
    where,
    orderBy
} from "firebase/firestore";

const COLLECTION = "announcements";

export const announcementsRepo = {
    getAll: async (organizationId: string): Promise<Announcement[]> => {
        try {
            const q = query(
                collection(db, COLLECTION),
                where("organizationId", "==", organizationId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        } catch (e) {
            console.error("Failed to fetch announcements", e);
            throw e;
        }
    },

    add: async (organizationId: string, announcement: Announcement) => {
        if (!organizationId) {
            throw new Error("organizationId is required");
        }
        const ref = announcement.id ? doc(db, COLLECTION, announcement.id) : doc(collection(db, COLLECTION));
        const newAnnouncement = {
            ...announcement,
            id: ref.id,
            organizationId,
            createdAt: announcement.createdAt || new Date().toISOString()
        };
        await setDoc(ref, newAnnouncement);
        return newAnnouncement;
    },

    delete: async (id: string) => {
        await deleteDoc(doc(db, COLLECTION, id));
    }
};
