import { BotModule, DatabaseEntry } from "@akaiv/core";
import { PlayCommand, CreateCommand, CustomCreateCommand, StatCommand, SpecCommand, UnSpecCommand, BoardCommand } from "./chess-command";
import { ChessManager } from "./chess-manager";

/*
 * Created on Sat Oct 26 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

// NOTE: Module should not target any specific bot. It's individual part.
export class ChessModule extends BotModule {

    private chessManager: ChessManager;

    constructor({ database }: { // ALways receive params as object
        database: DatabaseEntry
    }) {
        super();

        this.chessManager = new ChessManager(database);

        this.CommandManager.addCommand(new PlayCommand(this.chessManager));

        this.CommandManager.addCommand(new CreateCommand(this.chessManager));
        this.CommandManager.addCommand(new CustomCreateCommand(this.chessManager));

        this.CommandManager.addCommand(new StatCommand(this.chessManager));

        this.CommandManager.addCommand(new SpecCommand(this.chessManager));
        this.CommandManager.addCommand(new UnSpecCommand(this.chessManager));

        this.CommandManager.addCommand(new BoardCommand(this.chessManager));
    }

    get Name() {
        return 'Chess'; // Module name
    }

    get Description() {
        return '게임';
    }

    get Namespace() {
        return 'chess';
    }

    get ChessManager() {
        return this.chessManager;
    }

    protected async loadModule(): Promise<void> {

    }

    protected async unloadModule(): Promise<void> {

    }

}