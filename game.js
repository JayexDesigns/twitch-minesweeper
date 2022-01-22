class Game {
    constructor (rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.gameEnded = false;
        this.createBoard();
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < this.rows; ++i) {
            this.board.push([]);
            for (let j = 0; j < this.cols; ++j) {
                this.board[i].push({
                    "mine": false,
                    "flag": false,
                    "revealed": false,
                    "near": 0,
                });
            }
        }
    }



    placeMines() {
        const randomInRange = (min, max) => Math.floor(Math.random() * (max - min)) + min;

        let tempBoard = [];
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.cols; ++j) {
                tempBoard.push([i, j]);
            }
        }

        let minesLeft = this.mines;
        while (minesLeft !== 0 && tempBoard.length !== 0) {
            let tile = randomInRange(0, tempBoard.length);
            if(!this.board[tempBoard[tile][0]][tempBoard[tile][1]]["mine"]) {
                this.board[tempBoard[tile][0]][tempBoard[tile][1]]["mine"] = true;
                --minesLeft;
            }
            tempBoard.splice(tile, 1);
        }
    }

    setNearMinesTiles() {
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.cols; ++j) {
                let tile = this.board[i][j];

                if (tile["mine"]) continue;

                if (i > 0) {
                    if (this.board[i-1][j]["mine"]) ++tile["near"];
                    if (j > 0 && this.board[i-1][j-1]["mine"]) ++tile["near"];
                    if (j < this.cols-1 && this.board[i-1][j+1]["mine"]) ++tile["near"];
                }
                if (i < this.rows-1) {
                    if (this.board[i+1][j]["mine"]) ++tile["near"];
                    if (j > 0 && this.board[i+1][j-1]["mine"]) ++tile["near"];
                    if (j < this.cols-1 && this.board[i+1][j+1]["mine"]) ++tile["near"];
                }
                if (j > 0) {
                    if (this.board[i][j-1]["mine"]) ++tile["near"];
                }
                if (j < this.cols-1) {
                    if (this.board[i][j+1]["mine"]) ++tile["near"];
                }
            }
        }
    }



    revealTile(row, col) {
        if (this.gameEnded) return false;
        if (this.board[row][col]["revealed"] || this.board[row][col]["flag"]) return false;
        else if (this.board[row][col]["mine"]) {
            this.mineRevealed(row, col);
            return false;
        }
        else {
            this.board[row][col]["revealed"] = true;
            return true;
        }
    }

    toggleFlag(row, col) {
        if (this.gameEnded) return false;
        if (this.board[row][col]["revealed"]) return false;
        else if (this.board[row][col]["flag"]) {
            this.board[row][col]["flag"] = false;
            return true;
        }
        else if (!this.board[row][col]["flag"]) {
            this.board[row][col]["flag"] = true;
            return true;
        }
    }



    loseCallback(row, col) {
        return true;
    }

    mineRevealed(row, col) {
        this.gameEnded = true;
        this.loseCallback(row, col);
    }
}