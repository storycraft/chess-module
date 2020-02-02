import { ChessGame } from "./chess-game";
import { BotMessageEvent, ClientMessageEvent, Channel } from "@akaiv/core";
import { ChessManager } from "./chess-manager";
import { Square } from "chess.js";

/*
 * Created on Sun Feb 02 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class GameHandler {

    private listener: (e: ClientMessageEvent) => void;

    private listenerChannelList: Channel[];

    constructor(private game: ChessGame, private manager: ChessManager) {
        this.listener = this.onMessage.bind(this);

        this.listenerChannelList = [];
    }

    get Game() {
        return this.game;
    }

    async onStart() {
        this.registerListener();

        this.game.broadcastStart();

        await this.delay(1000);

        this.game.broadcastStatus();
    }

    async onEnd() {
        this.removeListener();

        this.game.broadcastResult();

        this.manager.removeGame(this.game.Id);
    }

    protected registerListener() {
        let list = this.game.getBroadcastChannelList();

        for (let chan of list) {
            chan.on('message', this.listener);
        }

        this.listenerChannelList = list;
    }

    protected removeListener() {
        for (let chan of this.listenerChannelList) {
            chan.off('message', this.listener);
        }
    }

    protected async onMessage(e: ClientMessageEvent) {
        if (e.Message.Sender !== this.game.Creator && e.Message.Sender !== this.game.Challenger!) return;

        let commandArray = e.Message.Text.split(' ');

        let user = e.Message.Sender;

        switch (commandArray[0]) {

            case 'sur':
                if (commandArray.length === 2 && commandArray[1] === user.Name) {
                    e.cancel();

                    let winner = user === this.game.Creator ? this.game.Challenger! : this.game.Creator;

                    this.game.broadcastMessage(`${this.game.getColorPrefix(user)} [${user.Client.ClientName}] ${user.Name} 가 기권을 선언했습니다`);

                    await this.delay(500);

                    this.game.Winner = winner;
                    this.game.end();
                }
                break;

            case 'move':
                if (commandArray.length < 3 || this.game.CurrentTurn !== user) break;

                let from = commandArray[1];
                let to = commandArray[2];

                let promotion = commandArray[3];

                let obj = {
                    from: from as Square,
                    to: to as Square
                } as any;

                if (promotion) {
                    obj['promotion'] = promotion;
                }

                let move = this.game.Board.move(obj);

                if (!move) {
                    e.Message.replyText('[chess] 해당 위치로 이동 할 수 없거나 필요한 정보가 누락되었습니다');
                    return;
                }

                e.cancel();

                await this.game.broadcastStatus();

                if (!this.game.canContinue()) {
                    this.game.end();
                }

                break;

            default: return;
        }
    }
    
    protected async delay(time: number) {
        return new Promise((resolve, reject) => setTimeout(resolve, time));
    }

}