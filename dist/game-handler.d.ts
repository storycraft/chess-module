import { ChessGame } from "./chess-game";
import { ClientMessageEvent } from "@akaiv/core";
import { ChessManager } from "./chess-manager";
export declare class GameHandler {
    private game;
    private manager;
    private listener;
    private listenerChannelList;
    constructor(game: ChessGame, manager: ChessManager);
    get Game(): ChessGame;
    onStart(): Promise<void>;
    onEnd(): Promise<void>;
    protected registerListener(): void;
    protected removeListener(): void;
    protected onMessage(e: ClientMessageEvent): Promise<void>;
    protected delay(time: number): Promise<unknown>;
}
