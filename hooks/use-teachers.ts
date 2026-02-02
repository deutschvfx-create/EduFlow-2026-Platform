import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Teacher } from '@/lib/types/teacher';
import { useOrganization } from '@/hooks/use-organization';

export function useTeachers() {
    const { currentOrganizationId } = useOrganization();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentOrganizationId || !db) {
            setTeachers([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "users"),
            where("organizationId", "==", currentOrganizationId),
            where("role", "==", "teacher")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Teacher[];
            setTeachers(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching teachers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrganizationId]);

    return { teachers, loading };
}
