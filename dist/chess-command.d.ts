import { CommandInfo, BotCommandEvent, ModuleLogger } from "@akaiv/core";
import { ChessManager } from "./chess-manager";
export declare class PlayCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): void;
}
export declare class CreateCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): void;
}
export declare class CustomCreateCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): void;
}
export declare class StatCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): Promise<void>;
}
export declare class SpecCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): Promise<void>;
}
export declare class UnSpecCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): Promise<void>;
}
export declare class BoardCommand implements CommandInfo {
    private chessManager;
    constructor(chessManager: ChessManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): Promise<void>;
}
