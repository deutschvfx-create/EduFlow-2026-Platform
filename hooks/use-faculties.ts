import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Faculty } from '@/lib/types/faculty';
import { useOrganization } from '@/hooks/use-organization';

export function useFaculties() {
    const { currentOrganizationId } = useOrganization();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentOrganizationId || !db) {
            setFaculties([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "faculties"),
            where("organizationId", "==", currentOrganizationId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Faculty[];
            setFaculties(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching faculties:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrganizationId]);

    return { faculties, loading };
}
