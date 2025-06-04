import Database from 'better-sqlite3';

import { ConfigHandler } from '../config/config';
const { ZOMBBBLOB_DB_PATH: DB_PATH } = ConfigHandler.getInstance().getConfig();

export interface Status {
    isRunning: boolean
};

export interface Words {
    word: string,
    infected: boolean
};

export class WordsDatabase {
    private static instance: WordsDatabase;
    private db: Database.Database;

    private constructor() {
        this.db = new Database(DB_PATH);

        // Create tables if they don't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS words (
                word TEXT PRIMARY KEY,
                infected BOOLEAN NOT NULL
            );

            CREATE TABLE IF NOT EXISTS status (
                isRunning BOOLEAN PRIMARY KEY,
                lastInfectedUNIXSeconds INTEGER
            );
        `);

        // Initialize status if empty
        const status = this.db.prepare('SELECT * FROM status LIMIT 1').get();
        if (!status) {
            this.db
                .prepare('INSERT INTO status (isRunning, lastInfectedUNIXSeconds) VALUES (?, ?)')
                .run(0, 'NULL');
        }
    }

    public static getInstance(): WordsDatabase {
        if (!WordsDatabase.instance) {
            WordsDatabase.instance = new WordsDatabase();
        }
        return WordsDatabase.instance;
    }

    public insertWord(word: string): void {
        this.db.prepare('INSERT OR REPLACE INTO words (word, infected) VALUES (?, 0)').run(word);
    }

    // Remove the word from DB unless it's infected
    // Returns boolean representing successful delete
    public removeWord(word: string): boolean {
        return this.db.prepare('DELETE FROM words WHERE word = ? AND infected = 0').run(word).changes === 1;
    }

    public clearWords(): void {
        this.db.prepare('DELETE FROM words').run();
    }

    public getAllWords(): Array<{ word: string; infected: boolean }> {
        const statement = this.db.prepare('SELECT * FROM words');
        return statement.all() as Array<{ word: string; infected: boolean }>;
    }

    public infectRandomWord(): string | null {
        const result = this.db
            .prepare('SELECT word FROM words ORDER BY RANDOM() LIMIT 1')
            .get() as { word: string };
        if (!result) {
            return null;
        }
        this.db.prepare('UPDATE words SET infected = 0 WHERE infected = 1').run();
        this.db.prepare('UPDATE words SET infected = 1 WHERE word = ?').run(result.word);
        return result.word;
    }

    public getInfectedWord(): string | null {
        const result = this.db
            .prepare('SELECT word FROM words WHERE infected = 1')
            .get() as { word: string } | undefined;
        return result === undefined ? null : result.word;
    }

    public setGameRunning(isRunning: boolean): void {
        this.db.prepare('UPDATE status SET isRunning = ?').run(isRunning ? 1 : 0);
    }

    public isGameRunning(): boolean {
        const result = this.db
            .prepare('SELECT isRunning FROM status LIMIT 1')
            .get() as { isRunning: boolean };
        return result?.isRunning ?? false;
    }

    public getLastInfected(): Date | null {
        const result = this.db
            .prepare('SELECT lastInfectedUNIXSeconds FROM status LIMIT 1')
            .get() as { lastInfectedUNIXSeconds: number | null };
        if (!result.lastInfectedUNIXSeconds) {
            return null;
        }
        return new Date(result.lastInfectedUNIXSeconds * 1000);
    }

    private _setLastInfected(d: Date | null): void {
        this.db.prepare('UPDATE status set lastInfectedUNIXSeconds = ?')
            .run(d === null ? 'NULL' : Math.floor(d.getTime() / 1000));
    }

    public setLastInfected(d: Date): void {
        this._setLastInfected(d);
    }

    public resetLastInfected(): void {
        this._setLastInfected(null);
    }
}