class Game {
    constructor (rows, cols, mines) {
        this.rows = parseInt(rows);
        this.cols = parseInt(cols);
        this.mines = mines;
        this.gameEnded = false;
        this.firstClick = true;
        this.createBoard();
    }

    // Creates The Starting Board With All Default Values
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



    // Places Random Mines In The Board
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

    // For Every Tile Searches The Nearby Mines And Sets That On The Tile Attributes
    setNearMinesTiles() {
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.cols; ++j) {
                let tile = this.board[i][j];
                tile["near"] = 0;

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



    // Callback Executed When The Board Is Rebuilded (Change It Once The Class Is Instanciated)
    rebuildBoardCallback() {
        return true;
    }

    // Displaces The Entire Board The Amount Of Tiles Specified
    displaceBoard(row1, col1, row2, col2) {
        let difference = [row1-row2, col1-col2];
        let tempBoard = [];
        for (let i = 0; i < this.rows; ++i) {
            tempBoard.push([]);
            for (let j = 0; j < this.cols; ++j) {
                let newRow = (i-difference[0]) % this.rows;
                let newCol = (j-difference[1]) % this.cols;
                if (newRow < 0) newRow = this.rows + newRow;
                if (newCol < 0) newCol = this.cols + newCol;
                tempBoard[i].push(this.board[newRow][newCol]);
            }
        }
        this.board = tempBoard;
        this.setNearMinesTiles();
        this.rebuildBoardCallback();
    }



    // Callback Executed When A Tile Is Revealed (Change It Once The Class Is Instanciated)
    revealCallback(row, col) {
        return true;
    }

    // Function In Charge Of Revealing Tiles And Also Handles The First Click
    revealTile(row, col, userClick=false) {
        if (this.gameEnded) return false;

        if ((this.board[row][col]["revealed"] && !userClick) || this.board[row][col]["flag"]) return false;

        else if (this.firstClick) {
            if (this.board[row][col]["near"] !== 0) {
                let displaced = false;
                for (let i = 1; i <= this.rows && !displaced; ++i) {
                    for (let j = 1; j <= this.cols && !displaced; ++j) {
                        let newI = i % this.rows;
                        let newJ = j % this.cols;
                        if (!this.board[newI][newJ]["mine"] && this.board[newI][newJ]["near"] === 0) {
                            this.displaceBoard(row, col, newI, newJ);
                            displaced = true;
                        }
                    }
                }
            }
            else if (this.board[row][col]["mine"]) {
                let displaced = false;
                for (let k = 0; k < 2 && !displaced; ++k) {
                    for (let i = 1; i <= this.rows && !displaced; ++i) {
                        for (let j = 1; j <= this.cols && !displaced; ++j) {
                            let newI = i % this.rows;
                            let newJ = j % this.cols;
                            if ((k === 0 && !this.board[newI][newJ]["mine"] && this.board[newI][newJ]["near"] === 0) || ((k === 1 && this.board[newI][newJ]["near"] !== 0))) {
                                this.displaceBoard(row, col, newI, newJ);
                                displaced = true;
                            }
                        }
                    }
                }
            }
            this.firstClick = false;
        }

        if (this.board[row][col]["mine"]) {
            this.mineRevealed(row, col);
            return false;
        }

        else if (this.board[row][col]["revealed"] && userClick && this.board[row][col]["near"] !== 0) {
            this.revealNearSecured(row, col);
            this.checkIfWon();
            return true;
        }

        else {
            this.board[row][col]["revealed"] = true;
            this.revealCallback(row, col);
            if (this.board[row][col]["near"] === 0) this.spreadReveal(row, col);
            this.checkIfWon();
            return true;
        }
    }

    // Code For Spreding The Reveal If A Tile Doesn't Have Mines Nearby
    spreadReveal(row, col) {
        if (row > 0) {
            this.revealTile(row-1, col);
            if (col > 0) this.revealTile(row-1, col-1);
            if (col < this.cols-1) this.revealTile(row-1, col+1);
        }
        if (row < this.rows-1) {
            this.revealTile(row+1, col);
            if (col > 0) this.revealTile(row+1, col-1);
            if (col < this.cols-1) this.revealTile(row+1, col+1);
        }
        if (col > 0) {
            this.revealTile(row, col-1);
        }
        if (col < this.cols-1) {
            this.revealTile(row, col+1);
        }
    }

    // Function To Reveal Near Tiles That Are 100% Not Mines Acording To The Flags
    revealNearSecured(row, col) {
        let nearFlags = 0;
        if (row > 0) {
            if (this.board[row-1][col]["flag"]) ++nearFlags;
            if (col > 0 && this.board[row-1][col-1]["flag"]) ++nearFlags;
            if (col < this.cols-1 && this.board[row-1][col+1]["flag"]) ++nearFlags;
        }
        if (row < this.rows-1) {
            if (this.board[row+1][col]["flag"]) ++nearFlags;
            if (col > 0 && this.board[row+1][col-1]["flag"]) ++nearFlags;
            if (col < this.cols-1 && this.board[row+1][col+1]["flag"]) ++nearFlags;
        }
        if (col > 0) {
            if (this.board[row][col-1]["flag"]) ++nearFlags;
        }
        if (col < this.cols-1) {
            if (this.board[row][col+1]["flag"]) ++nearFlags;
        }

        if (nearFlags >= this.board[row][col]["near"]) {
            if (row > 0) {
                if (!this.board[row-1][col]["revealed"]) this.revealTile(row-1, col);
                if (col > 0 && !this.board[row-1][col-1]["revealed"]) this.revealTile(row-1, col-1);
                if (col < this.cols-1 && !this.board[row-1][col+1]["revealed"]) this.revealTile(row-1, col+1);
            }
            if (row < this.rows-1) {
                if (!this.board[row+1][col]["revealed"]) this.revealTile(row+1, col);
                if (col > 0 && !this.board[row+1][col-1]["revealed"]) this.revealTile(row+1, col-1);
                if (col < this.cols-1 && !this.board[row+1][col+1]["revealed"]) this.revealTile(row+1, col+1);
            }
            if (col > 0) {
                if (!this.board[row][col-1]["revealed"]) this.revealTile(row, col-1);
            }
            if (col < this.cols-1) {
                if (!this.board[row][col+1]["revealed"]) this.revealTile(row, col+1);
            }
        }
    }



    // Callback Executed When The Flag Attribute Is Changed On A Tile (Change It Once The Class Is Instanciated)
    flagCallback(row, col) {
        return true;
    }

    // Function In Charge Of Toggling The Flag In A Tile
    toggleFlag(row, col) {
        if (this.gameEnded) return false;
        if (this.firstClick) return false;
        if (this.board[row][col]["revealed"]) return false;
        else if (this.board[row][col]["flag"]) {
            this.board[row][col]["flag"] = false;
            this.flagCallback(row, col);
            return true;
        }
        else if (!this.board[row][col]["flag"]) {
            this.board[row][col]["flag"] = true;
            this.flagCallback(row, col);
            return true;
        }
    }

    // Counts The Total Amount Of Flags In The Board
    countFlags() {
        let flags = 0;
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.cols; ++j) {
                if (this.board[i][j]["flag"]) ++flags;
            }
        }
        return flags;
    }



    // Callback Executed Once The Game Has Ended With A Lose (Change It Once The Class Is Instanciated)
    loseCallback(row, col) {
        return true;
    }

    // Function Called When A Mine Is Clicked
    mineRevealed(row, col) {
        this.gameEnded = true;
        this.loseCallback(row, col);
        return true;
    }



    // Callback Executed Once The Game Has Ended With A Win (Change It Once The Class Is Instanciated)
    winCallback() {
        return true;
    }

    // Checks If There's Any Not Revealed Tiles That Aren't Mines
    checkIfWon() {
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.cols; ++j) {
                if (!this.board[i][j]["mine"] && !this.board[i][j]["revealed"]) return false;
            }
        }
        this.gameEnded = true;
        this.winCallback();
        return true;
    }
}