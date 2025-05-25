import Database from 'better-sqlite3';

import { ConfigHandler } from '../config';
import { Snowflake } from 'discord.js';
import { getTodaysZipNumber, getZipNumberFromUnixMillis } from './zipgame';
import { DateTime } from 'luxon';
const { ZIPGAME_DB_PATH } = ConfigHandler.getInstance().getConfig();

export interface Result {
    message_id: Snowflake,
    author_id: Snowflake,
    game_number: number,
    time_seconds: number,
    backtracks: number | null
};

export interface AverageStatsResponse {
    average_time: number | null,
    average_backtracks: number | null,
    days_played: number,
    num_submissions: number
}

const AVERAGE_STATS_QUERY = "SELECT ROUND(AVG(time_seconds)) as average_time, " +
                            "       AVG(backtracks) as average_backtracks, " + 
                            "       COUNT(*) as num_submissions, " + 
                            "       COUNT(DISTINCT game_number) as days_played " +
                            "FROM results";

export class ZipGameDatabase {
    private static instance: ZipGameDatabase;
    private db: Database.Database;

    private constructor() {
        this.db = new Database(ZIPGAME_DB_PATH);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS results (
                message_id TEXT NOT NULL,
                author_id TEXT NOT NULL,
                game_number INTEGER NOT NULL,
                time_seconds INTEGER NOT NULL,
                backtracks INTEGER,
                PRIMARY KEY (author_id, game_number)
            );
        `);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS removed_results (
                message_id TEXT,
                PRIMARY KEY (message_id)
            );
        `);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS denylist (
                user_id TEXT,
                PRIMARY KEY (user_id)
            );
        `);
    }

    public static getInstance(): ZipGameDatabase {
        if (!ZipGameDatabase.instance) {
            ZipGameDatabase.instance = new ZipGameDatabase();
        }
        return ZipGameDatabase.instance;
    }

    public addSubmission(result: Result): void {
        this.db
            .prepare(
                "INSERT INTO results " +
                "(message_id, author_id, game_number, time_seconds, backtracks) " + 
                "VALUES (?, ?, ?, ?, ?)"
            )
            .run(result.message_id, result.author_id, result.game_number, result.time_seconds, result.backtracks);
    }

    public getLatestSubmission(authorID: string): Result | undefined {
        return this.db
            .prepare("SELECT * FROM results WHERE author_id = ? ORDER BY game_number DESC")
            .get(authorID) as Result;
    }

    public removeSubmission(messageID: string): boolean {
        const deleteResult = this.db
            .prepare("DELETE FROM results WHERE message_id = ?")
            .run(messageID);

        if (deleteResult.changes === 0) {
            return false;
        }

        this.db
            .prepare("INSERT INTO removed_results VALUES (?)")
            .run(messageID);

        return true;
    }

    public getAverageStats(): AverageStatsResponse {
        return this.db
                    .prepare(AVERAGE_STATS_QUERY)
                    .get() as AverageStatsResponse;
    }

    public getTodaysAverageStats(): AverageStatsResponse {
        return this.db
                    .prepare(AVERAGE_STATS_QUERY + " WHERE game_number = ?")
                    .get(getTodaysZipNumber()) as AverageStatsResponse;
    }

    public getWeeksAverageStats(): AverageStatsResponse {
        const sundayZipReset = DateTime.now()
                                     .setZone('America/Vancouver') // in PST
                                     .startOf('week') // Monday
                                     .minus({days: 1}) // Sunday
                                     .plus({hours: 3}); // 3am (when Zip resets)
        
        const startOfWeekZipNumber = getZipNumberFromUnixMillis(sundayZipReset.toMillis());

        return this.db
                    .prepare(AVERAGE_STATS_QUERY + " WHERE game_number BETWEEN ? and ?")
                    .get(startOfWeekZipNumber, getTodaysZipNumber()) as AverageStatsResponse;
    }

    public isSubmissionRemoved(messageID: Snowflake): boolean {
        return this.db
                    .prepare(
                        "SELECT * FROM removed_results " +
                        "WHERE message_id = ?"
                    )
                    .get(messageID) !== undefined;
    }

    public addToDenyList(userID: Snowflake): void {
        this.db
            .prepare("INSERT INTO denylist VALUES (?)")
            .run(userID);
    }

    public isDenyListed(userID: Snowflake): boolean {
        return this.db
                    .prepare(
                        "SELECT * FROM denylist " +
                        "WHERE user_id = ?"
                    )
                    .get(userID) !== undefined;
    }
}