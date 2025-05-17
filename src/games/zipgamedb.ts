import Database from 'better-sqlite3';

import { ConfigHandler } from '../config';
import { Snowflake } from 'discord.js';
import { getTodaysZipNumber } from './zipgame';
const { ZIPGAME_DB_PATH } = ConfigHandler.getInstance().getConfig();

export interface Result {
    messageID: Snowflake,
    authorID: Snowflake,
    gameNumber: number,
    timeSeconds: number,
    backtracks: number
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
                backtracks INTEGER NOT NULL,
                PRIMARY KEY (author_id, game_number)
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
            .run(result.messageID, result.authorID, result.gameNumber, result.timeSeconds, result.backtracks);
    }

    public removeSubmission(messageID: string): Database.RunResult {
        return this.db
            .prepare("DELETE FROM results WHERE message_id = ?")
            .run(messageID);
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
}