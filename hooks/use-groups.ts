import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group } from '@/lib/types/group';
import { useOrganization } from '@/hooks/use-organization';

export function useGroups() {
    const { currentOrganizationId } = useOrganization();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentOrganizationId || !db) {
            setGroups([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "groups"),
            where("organizationId", "==", currentOrganizationId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Group[];
            setGroups(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching groups:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrganizationId]);

    return { groups, loading };
}
