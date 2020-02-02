"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@akaiv/core");
const chess_command_1 = require("./chess-command");
const chess_manager_1 = require("./chess-manager");
class ChessModule extends core_1.BotModule {
    constructor({ database }) {
        super();
        this.chessManager = new chess_manager_1.ChessManager(database);
        this.CommandManager.addCommand(new chess_command_1.PlayCommand(this.chessManager));
        this.CommandManager.addCommand(new chess_command_1.CreateCommand(this.chessManager));
        this.CommandManager.addCommand(new chess_command_1.CustomCreateCommand(this.chessManager));
        this.CommandManager.addCommand(new chess_command_1.StatCommand(this.chessManager));
        this.CommandManager.addCommand(new chess_command_1.SpecCommand(this.chessManager));
        this.CommandManager.addCommand(new chess_command_1.UnSpecCommand(this.chessManager));
        this.CommandManager.addCommand(new chess_command_1.BoardCommand(this.chessManager));
    }
    get Name() {
        return 'Chess';
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
    async loadModule() {
    }
    async unloadModule() {
    }
}
exports.ChessModule = ChessModule;
//# sourceMappingURL=chess-module.js.map