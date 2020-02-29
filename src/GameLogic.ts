import * as THREE from 'three'
import { Vector2 } from 'three';

/**
 * The model class.  This class contains the current board state, which team the user is on (X's or O's) and other game data that
 * needs to be more permanently stored.
 */
export class GameLogic {
    private board: Array<Array<string>>;
    public userTeam: Team;
    public isPlayersTurn: boolean;
    public isOver: boolean;

    constructor() {
        // construct the board
        this.board = new Array<Array<string>>(3);
        for (let i = 0; i < 3; i++) {
            this.board[i] = new Array<string>(3);
            for (let j = 0; j < 3; j++) {
                this.board[i][j] = "";
            }
        }

        // on page load the player is playing as X
        this.userTeam = Team.X;
        this.isPlayersTurn = true;
        this.isOver = false;
    }

    private clearBoard() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                this.board[i][j] = "";
            }
        }
    }

    public resetGame() {
        // reset the board
        this.clearBoard();

        // reset the gameover state
        this.isOver = false;

        // reset the turn state
        switch (this.userTeam) {
            case Team.X:
                this.isPlayersTurn = true;
                break;
            case Team.O:
                this.isPlayersTurn = false;
                break;
            default:
                console.error("Invalid user team detected when resetting the game: " + Team[this.userTeam]);
        }
    }

    public checkAndGetWinnder(): Team {
        // 8 possible win conditions
        // 2 diagonals
        if (this.board[0][0] != "" && this.board[0][0] == this.board[1][1] && this.board[1][1] == this.board[2][2]) {
            return Team[this.board[0][0]];
        }
        if (this.board[0][2] != "" && this.board[0][2] == this.board[1][1] && this.board[1][1] == this.board[2][0]) {
            return Team[this.board[0][2]];
        }

        // 6 rows
        if (this.board[0][0] != "" && this.board[0][0] == this.board[1][0] && this.board[1][0] == this.board[2][0]) {
            return Team[this.board[0][0]];
        }
        if (this.board[0][0] != "" && this.board[0][0] == this.board[0][1] && this.board[0][1] == this.board[0][2]) {
            return Team[this.board[0][0]];
        }
        if (this.board[0][2] != "" && this.board[0][2] == this.board[1][2] && this.board[1][2] == this.board[2][2]) {
            return Team[this.board[0][2]];
        }
        if (this.board[2][0] != "" && this.board[2][0] == this.board[2][1] && this.board[2][1] == this.board[2][2]) {
            return Team[this.board[2][0]];
        }
        if(this.board[1][0] != "" && this.board[1][0] == this.board[1][1] && this.board[1][1] == this.board[1][2]) {
            return Team[this.board[1][0]];
        }
        if(this.board[0][1] != "" && this.board[0][1] == this.board[1][1] && this.board[1][1] == this.board[2][1]) {
            return Team[this.board[0][1]];
        }

        return null;
    }

    public isPiecePlayableAt(location: THREE.Vector2): boolean {
        if (this.board[location.x][location.y] == "") {
            return true;
        }
        else {
            return false;
        }
    }

    public playPieceAt(location: THREE.Vector2, piece: Team) {
        this.board[location.x][location.y] = Team[piece];
    }

    public setTeam(teamStr?: string, teamEnum?: Team) {
        if (teamStr && teamEnum) {
            console.error("Both enum and string were passed to GameLogic.setTeam");
        }
        else if (teamEnum) {
            this.userTeam = teamEnum;
            this.resetGame();
        }
        else if (teamStr) {
            this.userTeam = Team[teamStr];
            this.resetGame();
        }
        else {
            console.error("GameLogic.setTeam was called, but not passed any parameters");
        }


    }

    public getTeam() {
        return this.userTeam;
    }

    public getRandomUnusedBoardLocation(): THREE.Vector2 {
        let availablePlaces = Array<THREE.Vector2>();
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] == "") {
                    availablePlaces.push(new THREE.Vector2(i, j));
                }
            }
        }
        return availablePlaces[this.randomIntFromInterval(0, availablePlaces.length - 1)];
    }

    private randomIntFromInterval(min: number, max: number) {
        // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

export enum Team {
    X = 1,
    O,
}