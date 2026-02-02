import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Department } from '@/lib/types/department';
import { useOrganization } from '@/hooks/use-organization';

export function useDepartments() {
    const { currentOrganizationId } = useOrganization();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentOrganizationId || !db) {
            setDepartments([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "departments"),
            where("organizationId", "==", currentOrganizationId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Department[];
            setDepartments(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching departments:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentOrganizationId]);

    return { departments, loading };
}
