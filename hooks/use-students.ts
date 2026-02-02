import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student } from '@/lib/types/student';
import { useOrganization } from '@/hooks/use-organization';

export function useStudents() {
    const { currentOrganizationId } = useOrganization();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentOrganizationId || !db) {
            setStudents([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "users"),
            where("organizationId", "==", currentOrganizationId),
            where("role", "==", "student")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Student[];
            setStudents(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching students:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrganizationId]);

    return { students, loading };
}
