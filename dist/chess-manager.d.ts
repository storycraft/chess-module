import { ChessGame } from "./chess-game";
import { DatabaseEntry, User, Channel } from "@akaiv/core";
export declare class ChessManager {
    private database;
    private gameMap;
    private statEntry;
    constructor(database: DatabaseEntry);
    get Database(): DatabaseEntry<string, import("@akaiv/core").DatabaseValue>;
    getStatEntry(): Promise<DatabaseEntry<string, import("@akaiv/core").DatabaseValue>>;
    getWinStat(user: User): Promise<number>;
    setWinStat(user: User, count: number): Promise<void>;
    getLostStat(user: User): Promise<number>;
    setLostStat(user: User, count: number): Promise<void>;
    isPlaying(user: User): boolean;
    getGame(id: string): ChessGame | undefined;
    hasGame(id: string): boolean;
    createGame(user: User, gameChannel: Channel, fen?: string): ChessGame;
    removeGame(id: string): boolean;
}
