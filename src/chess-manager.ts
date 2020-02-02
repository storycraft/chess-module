import { ChessGame } from "./chess-game";
import { DatabaseEntry, User, Channel } from "@akaiv/core";

/*
 * Created on Sat Feb 01 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class ChessManager {

    private gameMap: Map<string, ChessGame>;

    private statEntry: DatabaseEntry | null;

    constructor(private database: DatabaseEntry) {
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
    
    async getWinStat(user: User): Promise<number> {
        let entry = await this.getStatEntry();

        if (await entry.has(user.IdentityId)) {
            let userEntry = await entry.getEntry(user.IdentityId);

            if (await userEntry.has('wins')) {
                return (await userEntry.get('wins')) as any;
            }
        }

        return 0;
    }

    async setWinStat(user: User, count: number) {
        let entry = await this.getStatEntry();

        let userEntry = await entry.getEntry(user.IdentityId);
        userEntry.set('wins', count);
    }

    async getLostStat(user: User): Promise<number> {
        let entry = await this.getStatEntry();

        if (await entry.has(user.IdentityId)) {
            let userEntry = await entry.getEntry(user.IdentityId);

            if (await userEntry.has('losts')) {
                return (await userEntry.get('losts')) as any;
            }
        }

        return 0;
    }

    async setLostStat(user: User, count: number) {
        let entry = await this.getStatEntry();

        let userEntry = await entry.getEntry(user.IdentityId);
        userEntry.set('losts', count);
    }

    isPlaying(user: User): boolean {
        for (let [ id, game ] of this.gameMap) {
            if (game.Creator.IdentityId === user.IdentityId || game.Challenger && game.Challenger.IdentityId === user.IdentityId) {
                return true;
            }
        }

        return false;
    }

    getGame(id: string) {
        return this.gameMap.get(id);
    }

    hasGame(id: string) {
        return this.gameMap.has(id);
    }

    createGame(user: User, gameChannel: Channel, fen?: string): ChessGame {
        let id: string;
        
        while (this.hasGame(id = Math.random().toString(36).substr(2, 9)));

        let game = new ChessGame(this, id, user, gameChannel, fen);

        this.gameMap.set(id, game);

        return game;
    }

    removeGame(id: string): boolean {
        return this.gameMap.delete(id);
    }

}