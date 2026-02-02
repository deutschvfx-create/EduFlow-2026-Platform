import { dbService } from './database.service';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Network } from '@capacitor/network';
import { v4 as uuidv4 } from 'uuid';

export class SyncManager {
    private static instance: SyncManager;
    private isSyncing = false;

    private constructor() { }

    public static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    public async syncAll(organizationId: string) {
        if (this.isSyncing) return;

        const status = await Network.getStatus();
        if (!status.connected) {
            console.log('[SyncManager] Offline - skipping sync');
            return;
        }

        this.isSyncing = true;
        console.log('[SyncManager] Starting sync...');

        try {
            // 1. Push pending mutations
            await this.pushMutations();

            // 2. Pull latest data
            await this.pullUsers(organizationId);
            await this.pullGroups(organizationId);

            console.log('[SyncManager] Sync completed');
        } catch (error) {
            console.error('[SyncManager] Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private async pushMutations() {
        const sql = dbService.getDb();
        const pending = await (await sql).query("SELECT * FROM mutation_queue ORDER BY created_at ASC");

        if (!pending.values || pending.values.length === 0) return;

        console.log(`[SyncManager] Pushing ${pending.values.length} mutations...`);

        for (const mutation of pending.values) {
            try {
                const { id, collection: colName, operation, doc_id, payload } = mutation;
                const data = payload ? JSON.parse(payload) : null;
                const ref = doc(db, colName, doc_id);

                if (operation === 'create') {
                    await setDoc(ref, data);
                } else if (operation === 'update') {
                    await updateDoc(ref, data);
                } else if (operation === 'delete') {
                    await deleteDoc(ref);
                }

                // Remove from queue on success
                await (await sql).run("DELETE FROM mutation_queue WHERE id = ?", [id]);
            } catch (e) {
                console.error('[SyncManager] Mutation failed:', mutation, e);
                // Implementation detail: Increment retry_count or leave for next time
            }
        }
    }

    private async pullUsers(organizationId: string) {
        const snapshot = await getDocs(query(collection(db, 'users'), where('organizationId', '==', organizationId)));
        const sql = await dbService.getDb();

        const students: any[] = [];
        const teachers: any[] = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const record = {
                id: doc.id,
                organizationId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                status: data.status,
                data: JSON.stringify(data),
                updated_at: Date.now(),
                is_dirty: 0
            };

            if (data.role === 'STUDENT') students.push(record);
            else if (data.role === 'TEACHER') teachers.push(record);
        });

        // Batch Insert Students
        if (students.length > 0) {
            await sql.run("DELETE FROM students WHERE organizationId = ? AND is_dirty = 0", [organizationId]); // Simple sync strategy: replace clean records
            for (const s of students) {
                await sql.run(
                    `INSERT OR REPLACE INTO students (id, organizationId, firstName, lastName, email, status, data, updated_at, is_dirty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                    [s.id, s.organizationId, s.firstName, s.lastName, s.email, s.status, s.data, s.updated_at]
                );
            }
        }

        // Batch Insert Teachers
        if (teachers.length > 0) {
            await sql.run("DELETE FROM teachers WHERE organizationId = ? AND is_dirty = 0", [organizationId]);
            for (const t of teachers) {
                await sql.run(
                    `INSERT OR REPLACE INTO teachers (id, organizationId, firstName, lastName, email, status, data, updated_at, is_dirty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                    [t.id, t.organizationId, t.firstName, t.lastName, t.email, t.status, t.data, t.updated_at]
                );
            }
        }
    }

    private async pullGroups(organizationId: string) {
        const snapshot = await getDocs(query(collection(db, 'groups'), where('organizationId', '==', organizationId)));
        const sql = await dbService.getDb();

        if (!snapshot.empty) {
            await sql.run("DELETE FROM groups WHERE organizationId = ? AND is_dirty = 0", [organizationId]);

            for (const doc of snapshot.docs) {
                const data = doc.data();
                await sql.run(
                    `INSERT OR REPLACE INTO groups (id, organizationId, name, data, updated_at, is_dirty) VALUES (?, ?, ?, ?, ?, 0)`,
                    [doc.id, organizationId, data.name, JSON.stringify(data), Date.now()]
                );
            }
        }
    }
}

export const syncManager = SyncManager.getInstance();
