"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chess_game_1 = require("./chess-game");
class ChessManager {
    constructor(database) {
        this.database = database;
        this.gameMap = new Map();
        this.statEntry = null;
    }
    get Database() {
        return this.database;
    }
    async getStatEntry() {
        if (this.statEntry) {
            return this.statEntry;
        }
        return (this.statEntry = await this.database.getEntry('stats'));
    }
    async getWinStat(user) {
        let entry = await this.getStatEntry();
        if (await entry.has(user.IdentityId)) {
            let userEntry = await entry.getEntry(user.IdentityId);
            if (await userEntry.has('wins')) {
                return (await userEntry.get('wins'));
            }
        }
        return 0;
    }
    async setWinStat(user, count) {
        let entry = await this.getStatEntry();
        let userEntry = await entry.getEntry(user.IdentityId);
        userEntry.set('wins', count);
    }
    async getLostStat(user) {
        let entry = await this.getStatEntry();
        if (await entry.has(user.IdentityId)) {
            let userEntry = await entry.getEntry(user.IdentityId);
            if (await userEntry.has('losts')) {
                return (await userEntry.get('losts'));
            }
        }
        return 0;
    }
    async setLostStat(user, count) {
        let entry = await this.getStatEntry();
        let userEntry = await entry.getEntry(user.IdentityId);
        userEntry.set('losts', count);
    }
    isPlaying(user) {
        for (let [id, game] of this.gameMap) {
            if (game.Creator.IdentityId === user.IdentityId || game.Challenger && game.Challenger.IdentityId === user.IdentityId) {
                return true;
            }
        }
        return false;
    }
    getGame(id) {
        return this.gameMap.get(id);
    }
    hasGame(id) {
        return this.gameMap.has(id);
    }
    createGame(user, gameChannel, fen) {
        let id;
        while (this.hasGame(id = Math.random().toString(36).substr(2, 9)))
            ;
        let game = new chess_game_1.ChessGame(this, id, user, gameChannel, fen);
        this.gameMap.set(id, game);
        return game;
    }
    removeGame(id) {
        return this.gameMap.delete(id);
    }
}
exports.ChessManager = ChessManager;
//# sourceMappingURL=chess-manager.js.map