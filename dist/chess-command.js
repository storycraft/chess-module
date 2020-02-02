"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Chess = require("chess.js");
class PlayCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['play'];
    }
    get Usage() {
        return 'chess/play <참가 코드>';
    }
    get Description() {
        return '만들어진 체스 게임에 참가합니다';
    }
    onCommand(e, logger) {
        if (this.chessManager.isPlaying(e.Sender)) {
            e.Channel.sendText('플레이 중에는 게임에 참가할 수 없습니다');
            return;
        }
        if (e.RawArgument.length < 1) {
            e.Channel.sendText(`사용법: ${this.Usage}`);
            return;
        }
        let code = e.RawArgument;
        if (!this.chessManager.hasGame(code)) {
            e.Channel.sendText(`게임 ${code} 를 찾을 수 없습니다`);
            return;
        }
        let game = this.chessManager.getGame(code);
        game.Challenger = e.Sender;
        if (!game.hasBroadcastChannel(e.Channel)) {
            game.addBroadcastChannel(e.Channel);
        }
        game.start();
    }
}
exports.PlayCommand = PlayCommand;
class CreateCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['create'];
    }
    get Usage() {
        return 'chess/create';
    }
    get Description() {
        return '체스 게임을 생성합니다';
    }
    onCommand(e, logger) {
        if (this.chessManager.isPlaying(e.Sender)) {
            e.Channel.sendText('플레이 중에는 게임을 생성할 수 없습니다');
            return;
        }
        let game = this.chessManager.createGame(e.Sender, e.Channel);
        setTimeout(() => { if (!game.Started) {
            this.chessManager.removeGame(game.Id);
        } }, 60 * 1000);
        e.Channel.sendText(`게임이 생성되었습니다\nId: ${game.Id}\n\n아래 커맨드를 입력하여 참가 할 수 있습니다\nchess/play ${game.Id}\n\n1분 이상 대기 시 자동으로 방이 제거 됩니다`);
    }
}
exports.CreateCommand = CreateCommand;
class CustomCreateCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['custom'];
    }
    get Usage() {
        return 'chess/custom <FEN 형식 보드 문자열>';
    }
    get Description() {
        return '커스텀 체스 게임을 생성합니다 (스탯 영향 X)';
    }
    onCommand(e, logger) {
        if (this.chessManager.isPlaying(e.Sender)) {
            e.Channel.sendText('플레이 중에는 게임을 생성할 수 없습니다');
            return;
        }
        let fen = e.RawArgument;
        let check = (new Chess.Chess()).validate_fen(fen);
        if (!check.valid) {
            e.Channel.sendText(`게임을 생성 할 수 없습니다\n-> ${check.error}`);
            return;
        }
        let game = this.chessManager.createGame(e.Sender, e.Channel, fen);
        setTimeout(() => { if (!game.Started) {
            this.chessManager.removeGame(game.Id);
        } }, 60 * 1000);
        e.Channel.sendText(`커스텀 게임이 생성되었습니다\nId: ${game.Id}\n\n아래 커맨드를 입력하여 참가 할 수 있습니다\nchess/play ${game.Id}\n\n1분 이상 대기 시 자동으로 방이 제거 됩니다`);
    }
}
exports.CustomCreateCommand = CustomCreateCommand;
class StatCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['stat'];
    }
    get Usage() {
        return 'chess/stat [유저 닉네임 또는 유저 Id]';
    }
    get Description() {
        return '스탯보기';
    }
    async onCommand(e, logger) {
        let user = e.Sender;
        if (e.RawArgument.length > 0) {
            let target = e.RawArgument;
            let list = (await e.Channel.getUserList()).filter((user) => user.Name === target || user.Id === target || user.IdentityId === target);
            if (list.length < 1) {
                e.Channel.sendText(`유저 ${target} 을 찾을 수 없습니다`);
                return;
            }
            user = list[0];
        }
        let winCount = await this.chessManager.getWinStat(user);
        let lostCount = await this.chessManager.getLostStat(user);
        e.Channel.sendText(`${user.Name} 의 스탯\n\n승: ${winCount}\n패: ${lostCount}\n\n승률 ${((winCount / lostCount) * 100).toFixed(2)}%`);
    }
}
exports.StatCommand = StatCommand;
class SpecCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['spec'];
    }
    get Usage() {
        return 'chess/spec <게임 id>';
    }
    get Description() {
        return '매치를 관전합니다';
    }
    async onCommand(e, logger) {
        if (e.RawArgument.length < 1) {
            e.Channel.sendText(`사용법: ${this.Usage}`);
            return;
        }
        let code = e.RawArgument;
        if (!this.chessManager.hasGame(code)) {
            e.Channel.sendText(`게임 ${code} 를 찾을 수 없습니다`);
            return;
        }
        let game = this.chessManager.getGame(code);
        if (game.addBroadcastChannel(e.Channel)) {
            e.Channel.sendText(`게임 ${code} 을 관전 합니다`);
            game.sendStatus(e.Channel);
        }
        else {
            e.Channel.sendText(`게임 ${code} 은 이미 관전 중 입니다`);
        }
    }
}
exports.SpecCommand = SpecCommand;
class UnSpecCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['unspec'];
    }
    get Usage() {
        return 'chess/unspec <게임 id>';
    }
    get Description() {
        return '매치 관전을 종료합니다';
    }
    async onCommand(e, logger) {
        if (e.RawArgument.length < 1) {
            e.Channel.sendText(`사용법: ${this.Usage}`);
            return;
        }
        let code = e.RawArgument;
        if (!this.chessManager.hasGame(code)) {
            e.Channel.sendText(`게임 ${code} 를 찾을 수 없습니다`);
            return;
        }
        let game = this.chessManager.getGame(code);
        if (game.removeBroadcastChannel(e.Channel)) {
            e.Channel.sendText(`게임 ${code} 관전이 종료 되었습니다`);
        }
        else {
            e.Channel.sendText(`게임 ${code} 관전중이 아닙니다`);
        }
    }
}
exports.UnSpecCommand = UnSpecCommand;
class BoardCommand {
    constructor(chessManager) {
        this.chessManager = chessManager;
    }
    get CommandList() {
        return ['board'];
    }
    get Usage() {
        return 'chess/board <게임 id>';
    }
    get Description() {
        return '해당 게임의 판 정보를 가져옵니다 (FEN)';
    }
    async onCommand(e, logger) {
        if (e.RawArgument.length < 1) {
            e.Channel.sendText(`사용법: ${this.Usage}`);
            return;
        }
        let code = e.RawArgument;
        if (!this.chessManager.hasGame(code)) {
            e.Channel.sendText(`게임 ${code} 를 찾을 수 없습니다`);
            return;
        }
        let game = this.chessManager.getGame(code);
        e.Channel.sendText(`게임 ${code} 의 판 정보\n\n${game.Board.fen()}`);
    }
}
exports.BoardCommand = BoardCommand;
//# sourceMappingURL=chess-command.js.map