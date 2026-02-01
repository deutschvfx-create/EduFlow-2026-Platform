import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export class DatabaseService {
    private static instance: DatabaseService;
    private sqlite: SQLiteConnection;
    private db: SQLiteDBConnection | null = null;
    private dbName = 'eduflow_db';
    private isInitialized = false;

    private constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Create/Open Database
            this.db = await this.sqlite.createConnection(
                this.dbName,
                false,
                'no-encryption',
                1,
                false
            );

            await this.db.open();

            // Create Tables
            await this.createTables();

            this.isInitialized = true;
            console.log('[DatabaseService] Initialized successfully');
        } catch (error) {
            console.error('[DatabaseService] Failed to initialize:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) return;

        const schema = `
            CREATE TABLE IF NOT EXISTS system_metadata (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS mutation_queue (
                id TEXT PRIMARY KEY,
                collection TEXT NOT NULL,
                operation TEXT NOT NULL, -- 'create', 'update', 'delete'
                doc_id TEXT NOT NULL,
                payload TEXT, -- JSON string
                created_at INTEGER,
                retry_count INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                organizationId TEXT NOT NULL,
                firstName TEXT,
                lastName TEXT,
                email TEXT,
                status TEXT,
                data TEXT, -- Full JSON object for extra fields
                updated_at INTEGER,
                is_dirty INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS teachers (
                id TEXT PRIMARY KEY,
                organizationId TEXT NOT NULL,
                firstName TEXT,
                lastName TEXT,
                email TEXT,
                status TEXT,
                data TEXT,
                updated_at INTEGER,
                is_dirty INTEGER DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                organizationId TEXT NOT NULL,
                name TEXT,
                data TEXT,
                updated_at INTEGER,
                is_dirty INTEGER DEFAULT 0
            );
        `;

        await this.db.execute(schema);
    }

    public async getDb(): Promise<SQLiteDBConnection> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (!this.db) throw new Error('Database not initialized');
        return this.db;
    }
}

export const dbService = DatabaseService.getInstance();
