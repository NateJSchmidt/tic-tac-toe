import * as THREE from 'three';
import { World, Pieces } from "./World"
import { GameLogic, Team } from "./GameLogic"

/**
 * The controller class
 */
export class Controller {
    private PLAYER_TURN_LABEL_TEXT = "Your Turn!";
    private AI_TURN_LABEL_TEXT = "Computer's Turn!";
    private AI_WINS_LABEL_TEXT = "Computer Wins!!!";
    private PLAYER_WINS_LABEL_TEXT = "You Win!!!";
    private turnLabel: HTMLLabelElement;
    private world: World;
    private gameState: GameLogic;

    constructor(world: World, game: GameLogic) {
        this.world = world
        this.gameState = game;

        //fetch the turn label
        this.turnLabel = <HTMLLabelElement>document.getElementById("player-turn");

        // setup top div callbacks
        document.getElementById("resetButton").addEventListener("click", evt => this.handle_reset_button_click(evt)), false;
        document.getElementById("x").addEventListener("click", evt => this.handle_radio_button_selection(evt));
        document.getElementById("o").addEventListener("click", evt => this.handle_radio_button_selection(evt));

        // setup canvas callbacks
        document.getElementsByTagName("canvas")[0].addEventListener('click', evt => this.onMouseClick(evt), false);
    }

    private handle_reset_button_click(event: MouseEvent) {
        this.resetGame();
    }

    private resetGame() {
        // reset the game
        this.gameState.resetGame();

        // clear the view
        this.world.removeAllSpawnedPieces();

        // handle AI turn or wait for user input
        if (this.gameState.isPlayersTurn) {
            this.turnLabel.textContent = this.PLAYER_TURN_LABEL_TEXT;
        }
        else {
            this.turnLabel.textContent = this.AI_TURN_LABEL_TEXT;
            setTimeout(() => this.executeAITurn(), 3000);
        }
    }

    private handle_radio_button_selection(event: MouseEvent) {
        let element = <HTMLInputElement>event.target;
        this.gameState.setTeam(element.value);
        this.resetGame();
    }

    private onMouseClick(event: MouseEvent): void {
        // prevent default actions... TODO - look into this
        event.preventDefault();
        // check if the game is over and if it's your turn
        if (!this.gameState.isOver && this.gameState.isPlayersTurn) {
            // calculate where click was made
            let mouseCoords = this.normalizeWindowCoordinates(new THREE.Vector2(event.clientX, event.clientY));
            let boardPosition = this.world.getBoardPositionFrom(mouseCoords);

            // check if click is valid
            if (boardPosition && this.gameState.isPiecePlayableAt(boardPosition)) {
                // spawn piece
                let currentTeam = this.gameState.getTeam();
                switch (currentTeam) {
                    case Team.X:
                        this.gameState.playPieceAt(boardPosition, currentTeam);
                        this.world.spawnPieceAt(Pieces.X, boardPosition);
                        break;
                    case Team.O:
                        this.gameState.playPieceAt(boardPosition, currentTeam);
                        this.world.spawnPieceAt(Pieces.O, boardPosition);
                        break;
                    default:
                        console.error("Trying to spawn a piece with invalid team: " + Team[currentTeam]);
                }

                // check for win condition
                if (!this.checkAndSetWinCondition()) {
                    // initiate computer's turn
                    this.gameState.isPlayersTurn = false;
                    this.turnLabel.textContent = this.AI_TURN_LABEL_TEXT;
                    setTimeout(() => this.executeAITurn(), 3000);
                }
            }
        }
    }

    private checkAndSetWinCondition(): boolean {
        let winner = this.gameState.checkAndGetWinnder();
        if (winner) {
            this.gameState.isOver = true;
            if (winner == this.gameState.userTeam) {
                // the player won
                this.turnLabel.textContent = this.PLAYER_WINS_LABEL_TEXT;
            }
            else {
                // the AI won
                this.turnLabel.textContent = this.AI_WINS_LABEL_TEXT;
            }
            return true;
        }
        return false;
    }

    private executeAITurn() {
        if (!this.gameState.isOver) {
            console.log("Executing AI's turn");
            let playPieceAt = this.gameState.getRandomUnusedBoardLocation();
            let currentTeam = this.gameState.getTeam();
            switch (currentTeam) {
                case Team.X:
                    this.gameState.playPieceAt(playPieceAt, Team.O);
                    this.world.spawnPieceAt(Pieces.O, playPieceAt);
                    break;
                case Team.O:
                    this.gameState.playPieceAt(playPieceAt, Team.X);
                    this.world.spawnPieceAt(Pieces.X, playPieceAt);
                    break;
                default:
                    console.error("Trying to spawn a piece with invalid team: " + Team[currentTeam]);
            }

            //check for win condition, otherwise initiate player turn
            if (!this.checkAndSetWinCondition()) {
                this.gameState.isPlayersTurn = true;
                this.turnLabel.textContent = this.PLAYER_TURN_LABEL_TEXT;
            }
        }
    }

    private normalizeWindowCoordinates(coords: THREE.Vector2): THREE.Vector2 {
        return new THREE.Vector2(
            (coords.x / window.innerWidth) * 2 - 1,
            (coords.y / window.innerHeight) * 2 - 1
        );
    }
}