import { BotModule, DatabaseEntry } from "@akaiv/core";
import { ChessManager } from "./chess-manager";
export declare class ChessModule extends BotModule {
    private chessManager;
    constructor({ database }: {
        database: DatabaseEntry;
    });
    get Name(): string;
    get Description(): string;
    get Namespace(): string;
    get ChessManager(): ChessManager;
    protected loadModule(): Promise<void>;
    protected unloadModule(): Promise<void>;
}
