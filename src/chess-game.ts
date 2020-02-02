import { User, Channel, AttachmentTemplate, TemplateAttachment, AttachmentType } from "@akaiv/core";
import * as Chess from "chess.js";
import * as Canvas from "canvas";
import * as fs from "fs";
import { ChessManager } from "./chess-manager";
import { GameHandler } from "./game-handler";

/*
 * Created on Sat Feb 01 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class ChessGame {

    public static readonly BOARD_WIDTH = 360;
    public static readonly BOARD_HEIGHT = 360;

    public static readonly PIECE_WIDTH = 45;
    public static readonly PIECE_HEIGHT = 45;

    public static readonly SQAURE_WIDTH = 45;
    public static readonly SQAURE_HEIGHT = 45;

    public static readonly HIGHLIGHT_WIDTH = 45;
    public static readonly HIGHLIGHT_HEIGHT = 45;

    public static readonly BOARD_IMG = '../chess-module/resources/chessboard.png';
    public static readonly PIECES_SPRITE_IMG = '../chess-module/resources/chess_pieces.png';
    public static readonly OVERLAY_IMG = '../chess-module/resources/chessoverlay.png';
    public static readonly HIGHLIGHT_IMG = '../chess-module/resources/highlight.png';

    private static BOARD_BUFFER: Buffer | null = null;
    private static SPRITE_BUFFER: Buffer | null = null;
    private static OVERLAY_BUFFER: Buffer | null = null;
    private static HIGHLIGHT_BUFFER: Buffer | null = null;
    
    protected static async readFileAsync(path: fs.PathLike | number): Promise<Buffer> {
        return new Promise((resolve, reject) => fs.readFile(path, (err, data) => { if (err) { reject(err); } else { resolve(data); } }));
    }

    static async getBoard(): Promise<Buffer> {
        if (this.BOARD_BUFFER) {
            return this.BOARD_BUFFER;
        }

        return (this.BOARD_BUFFER = await this.readFileAsync(this.BOARD_IMG));
    }

    static async getSprite(): Promise<Buffer> {
        if (this.SPRITE_BUFFER) {
            return this.SPRITE_BUFFER;
        }

        return (this.SPRITE_BUFFER = await this.readFileAsync(this.PIECES_SPRITE_IMG));
    }

    static async getOverlay(): Promise<Buffer> {
        if (this.OVERLAY_BUFFER) {
            return this.OVERLAY_BUFFER;
        }

        return (this.OVERLAY_BUFFER = await this.readFileAsync(this.OVERLAY_IMG));
    }

    static async getHighlight(): Promise<Buffer> {
        if (this.HIGHLIGHT_BUFFER) {
            return this.HIGHLIGHT_BUFFER;
        }

        return (this.HIGHLIGHT_BUFFER = await this.readFileAsync(this.HIGHLIGHT_IMG));
    }

    private challenger: User | null; // BLACK
    private broadcastChannelList: Channel[];

    private board: Chess.ChessInstance;

    private started: boolean;

    private handler: GameHandler;

    private custom: boolean;

    private winner: User | null;

    constructor(private manager: ChessManager, private id: string, private creator: User /* WHITE */, createdChannel: Channel, fen?: string) {
        this.challenger = null;

        this.board = new Chess.Chess(fen);

        if (fen) this.custom = true;
        else this.custom = false;

        this.broadcastChannelList = [ createdChannel ];

        this.winner = null;

        this.handler = new GameHandler(this, manager);

        this.started = false;
    }

    get Id() {
        return this.id;
    }
    
    get Custom() {
        return this.custom;
    }

    get Board() {
        return this.board;
    }

    get Creator() {
        return this.creator;
    }

    get Handler() {
        return this.handler;
    }

    hasBroadcastChannel(chan: Channel): boolean {
        return this.broadcastChannelList.includes(chan);
    }

    addBroadcastChannel(chan: Channel): boolean {
        if (this.hasBroadcastChannel(chan)) return false;

        this.broadcastChannelList.push(chan);

        return true;
    }

    getBroadcastChannelList() {
        return this.broadcastChannelList;
    }

    removeBroadcastChannel(chan: Channel): boolean {
        if (!this.hasBroadcastChannel(chan)) return false;

        this.broadcastChannelList.splice(this.broadcastChannelList.indexOf(chan), 1);

        return true;
    }

    get Challenger() {
        return this.challenger;
    }

    set Challenger(challenger) {
        this.challenger = challenger;
    }

    get CanStart(): boolean {
        return !!this.challenger;
    }

    get Started() {
        return this.started;
    }

    start(): boolean {
        if (!this.CanStart || this.started) return false;

        this.started = true;

        this.onStart();

        return true;
    }

    end(): boolean {
        if (!this.started) return false;

        this.started = false;

        this.onEnd();

        return true;
    }

    get CurrentTurn(): User {
        return this.board.turn() === this.board.BLACK ? this.creator : this.challenger!;
    }

    get CurrentColor(): string {
        return this.board.turn() === this.board.BLACK ? '흑' : '백';
    }

    get Winner() {
        return this.winner;
    }

    set Winner(winner) {
        this.winner = winner;
    }

    getColorPrefix(user: User): string {
        if (user === this.creator) {
            return '흑';
        } else if (user === this.challenger) {
            return '백'
        }

        throw '해당 유저는 플레이어가 아닙니다';
    }

    canContinue() {
        return !this.board.game_over();
    }

    async renderChessboard(): Promise<Buffer> {
        let canvas: Canvas.Canvas = Canvas.createCanvas(ChessGame.BOARD_WIDTH, ChessGame.BOARD_HEIGHT);

        let ctx = canvas.getContext('2d');

        let board: Canvas.Image = await Canvas.loadImage(await ChessGame.getBoard());
        let pieceSprite: Canvas.Image = await Canvas.loadImage(await ChessGame.getSprite());
        let overlay: Canvas.Image = await Canvas.loadImage(await ChessGame.getOverlay());
        let highlightOverlay: Canvas.Image = await Canvas.loadImage(await ChessGame.getHighlight());

        ctx.drawImage(board, 0, 0);
        
        //F
        let squares = (this.board as any).board() as Chess.Piece[][];

        for (let height = 0; height < squares.length; height++) {
            let line = squares[height];

            for (let width = 0; width < line.length; width++) {
                let piece: null | Chess.Piece = line[width];

                if (piece) {
                    let offsetX = 0;
                    let offsetY = (piece.color === this.board.WHITE ? 0 : 1) * ChessGame.PIECE_HEIGHT;
                    let highlight = false;

                    switch (piece.type) {
                        case this.board.PAWN:
                            offsetX = 5 * ChessGame.PIECE_WIDTH;
                            break;
                        
                        case this.board.ROOK:
                            offsetX = 4 * ChessGame.PIECE_WIDTH;
                            break;

                        case this.board.KNIGHT:
                            offsetX = 3 * ChessGame.PIECE_WIDTH;
                            break;

                        case this.board.BISHOP:
                            offsetX = 2 * ChessGame.PIECE_WIDTH;
                            break;

                        case this.board.KING:
                            offsetX = 0 * ChessGame.PIECE_WIDTH;
                            highlight = this.board.in_check() && this.board.turn() === piece.color;
                            break;

                        case this.board.QUEEN:
                            offsetX = 1 * ChessGame.PIECE_WIDTH;
                            break;

                        default:
                            break;
                    }

                    let posX = width * ChessGame.SQAURE_WIDTH;
                    let posY = height * ChessGame.SQAURE_HEIGHT;

                    ctx.drawImage(pieceSprite, offsetX, offsetY, ChessGame.PIECE_WIDTH, ChessGame.PIECE_HEIGHT, posX, posY, ChessGame.PIECE_WIDTH, ChessGame.PIECE_HEIGHT);
                    if (highlight) {
                        ctx.drawImage(highlightOverlay, posX, posY);
                    }
                }
            }
        }

        ctx.drawImage(overlay, 0, 0);

        return canvas.toBuffer();
    }

    async sendChessboard(chan: Channel) {
        let rendered = await this.renderChessboard();

        chan.sendRichTemplate(new AttachmentTemplate('', new TemplateAttachment(AttachmentType.IMAGE, 'chessboard.png', rendered)));
    }

    async broadcastStatus() {
        await Promise.all(this.broadcastChannelList.map(this.sendStatus.bind(this)));
    }

    async broadcastMessage(message: string) {
        await Promise.all(this.broadcastChannelList.map((chan) => chan.sendText(message)));
    }

    async sendStatus(chan: Channel) {
        await this.sendChessboard(chan);
        chan.sendText(`-> ${this.board.turn() === this.board.BLACK ? this.creator.Name : this.challenger!.Name}`);
        
        if (this.board.in_draw()) {
            let reason = '50수 규칙 적용';

            if (this.board.insufficient_material()) {
                reason = '체크메이트 불가능';
            }

            if (this.board.in_stalemate()) {
                reason = '스테일메이트';
            }
            
            if (this.board.in_threefold_repetition()) {
                reason = '동형반복(3회)';
            }

            chan.sendText(`${reason} 상태입니다. 해당 게임은 스탯에 영향을 미치지 않습니다`);
        } else if (this.board.in_checkmate()) {
            chan.sendText(`체크메이트 상태입니다. ${this.CurrentColor}([${this.CurrentTurn.Client.ClientName}] ${this.CurrentTurn.Name}) 이 더 이상 움직일 곳이 없습니다`);
            this.winner = this.CurrentTurn === this.creator ? this.challenger! : this.creator;
        }
    }

    async broadcastStart() {
        await Promise.all(this.broadcastChannelList.map(this.sendStartMessage.bind(this)));
    }

    async sendStartMessage(chan: Channel) {
        if (!this.started) return false;

        chan.sendText(`[chess] 게임이 시작되었습니다.\nId: ${this.id}\n\n W [${this.challenger!.Client.ClientName}] ${this.challenger!.Name} VS B [${this.creator.Client.ClientName}] ${this.creator.Name}\n\n플레이어는 해당 커맨드를 사용 할 수 있습니다\n - move <위치1> <위치2> [promotion(필요시)] : 위치 1의 말을 2로 이동합니다\n - sur <자신의닉네임> : 기권\n\n Promotion 코드\n - n : 나이트\n - b : 비숍\n - r : 룩\n - q : 퀸`);
    }

    async broadcastResult() {
        await Promise.all(this.broadcastChannelList.map(this.sendResultMessage.bind(this)));
    }

    async sendResultMessage(chan: Channel) {
        if (this.custom) {
            chan.sendText('커스텀 게임은 스탯에 영향을 미치지 않습니다');
            return;
        }

        if (this.winner) {
            let winner = this.winner;
            let loser = winner === this.creator ? this.challenger! : winner;

            this.manager.setWinStat(winner, (await this.manager.getWinStat(winner)) + 1);
            this.manager.setLostStat(loser, (await this.manager.getLostStat(loser)) + 1);
        }

        chan.sendText(`B [${this.creator.Client.ClientName}] ${this.creator.Name}\n - 승: ${await this.manager.getWinStat(this.creator)}\n - 패: ${await this.manager.getLostStat(this.creator)}\n\nW [${this.challenger!.Client.ClientName}] ${this.challenger!.Name}\n - 승: ${await this.manager.getWinStat(this.challenger!)}\n - 패: ${await this.manager.getLostStat(this.challenger!)}`);
    }

    protected async onStart() {
        this.handler.onStart();
    }

    protected async onEnd() {
        this.handler.onEnd();
    }

}