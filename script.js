// This Section Is Just For The Config Menu Display Functionality
const settingsOpen = document.getElementById("settings-open");
const settingsClose = document.getElementById("settings-close");
const config = document.getElementById("config");

settingsOpen.addEventListener('click', () => {
    config.style.right = "0";
});

settingsClose.addEventListener('click', () => {
    config.style.right = "var(--config-default-position)";
});

const configForm = document.getElementById("config-form");
configForm.addEventListener('submit', (e) => e.preventDefault());





// Creates All The DOM Elements That Corresponds To The Board, Including Mines And Flags That Are Hidden At Start
const createBoard = (mineSweeper) => {
    game.innerHTML = ``;

    game.style.gridTemplateColumns = `repeat(${cols.value}, 1fr)`;

    for (let i = 0; i < mineSweeper.rows; ++i) {
        for (let j = 0; j < mineSweeper.cols; ++j) {
            // Creates All The Tiles
            let tile = document.createElement("div");
            tile.classList.add("game-tile");
            tile.id = `game-tile-${i}-${j}`;
            tile.addEventListener('mousedown', (e) => tileClickHandler(e, i, j));
            tile.addEventListener('contextmenu', (e) => e.preventDefault(), false);
            game.appendChild(tile);

            let tileBackground = document.createElement("div");
            tileBackground.classList.add("game-tile-background");
            tileBackground.id = `game-tile-background-${i}-${j}`;
            tile.appendChild(tileBackground);

            // Creates All The Flags And Hides Them
            let flag = document.createElement("i");
            flag.classList.add("fas", "fa-flag", "game-tile-flag", "game-hidden");
            flag.id = `game-tile-flag-${i}-${j}`;
            tile.appendChild(flag);

            // Creates The Mines In The Correct Tiles And Hides Them
            if (mineSweeper.board[i][j]["mine"]) {
                let mine = document.createElement("i");
                mine.classList.add("fas", "fa-bomb", "game-tile-mine", "game-hidden");
                tile.appendChild(mine);
            }

            // Creates All The Near Mine Numbers And Hides Them (They Also Have A Low Z Index Value)
            if (mineSweeper.board[i][j]["near"] > 0) {
                let near = document.createElement("p");
                near.classList.add("game-tile-near", "game-hidden");
                near.id = `game-tile-near-${i}-${j}`;
                near.innerText = mineSweeper.board[i][j]["near"];
                tile.appendChild(near);
            }
        }
    }
};



// Handles The Click Of The User On A Specific Tile
const tileClickHandler = (e, i, j) => {
    e.preventDefault();

    // Left Click Will Remove The Tile If Successful, If Not It Won't Do Nothing
    if (e.button === 0) {
        mineSweeper.revealTile(i, j, true);
    }

    // Right Click Will Show The Flag If The Tile Is Not Revealed And Hide It If There Was Already A Flag
    else if (e.button === 2) {
        mineSweeper.toggleFlag(i, j);
    }
};





const game = document.getElementById("game");
const rows = document.getElementById("config-rows");
const cols = document.getElementById("config-cols");
const mines = document.getElementById("config-mines");
const reset = document.getElementById("config-reset");
const message = document.getElementById("message");
const messageText = document.getElementById("message-text");
const messageButton = document.getElementById("message-button");
let mineSweeper;

// When The Function Start All The Game Resets
const start = () => {
    message.style.visibility = "hidden";
    message.style.opacity = "0";
    message.style.top = "40%";

    // sanitizeInputs();

    // Creates The Game
    mineSweeper = new Game(rows.value, cols.value, mines.value);

    // Places The Mines In Random Places (Later In First Reveal The Board Will Be Displaced)
    mineSweeper.placeMines();
    mineSweeper.setNearMinesTiles();

    // This Callback Is Executed When The Game Ends And The Player Lost (Shows All The Mines)
    mineSweeper.loseCallback = (row, col) => {
        let flags = document.getElementsByClassName("game-tile-flag");
        let mines = document.getElementsByClassName("game-tile-mine");
        for (let flag of flags) {
            flag.classList.remove("game-shown");
            flag.classList.add("game-hidden");
        }
        for (let mine of mines) {
            mine.classList.remove("game-hidden");
            mine.classList.add("game-shown");
        }
        messageText.innerText = "You Lost!";
        message.style.visibility = "visible";
        message.style.opacity = "1";
        message.style.top = "50%";
    };

    // This Callback Is Executed When The Game Ends And The Player Won
    mineSweeper.winCallback = (row, col) => {
        let flags = document.getElementsByClassName("game-tile-flag");
        for (let flag of flags) {
            flag.classList.remove("game-shown");
            flag.classList.add("game-hidden");
        }
        messageText.innerText = "You Won!";
        message.style.visibility = "visible";
        message.style.opacity = "1";
        message.style.top = "50%";
    };

    // This Callback Is Executed When A Tile Is Revealed So The Background Disapears And Shows The Number Behind It
    mineSweeper.revealCallback = (row, col) => {
        let tileBackground = document.getElementById(`game-tile-background-${row}-${col}`);
        tileBackground.style.transform = `scale(0)`;
        if (mineSweeper.board[row][col]["near"] > 0) {
            let near = document.getElementById(`game-tile-near-${row}-${col}`);
            near.classList.remove("game-hidden");
            near.classList.add("game-shown");
        }
    };

    // This Callback Just Toggles A Flag On A Tile
    mineSweeper.flagCallback = (row, col) => {
        let flag = document.getElementById(`game-tile-flag-${row}-${col}`);
        if (mineSweeper.board[row][col]["flag"]) {
            flag.classList.remove("game-hidden");
            flag.classList.add("game-shown");
        }
        else if (!mineSweeper.board[row][col]["flag"]) {
            flag.classList.remove("game-shown");
            flag.classList.add("game-hidden");
        }
    };

    // This Callback Is For Rebuilding The Board For When The Displacement Function Is Executed
    mineSweeper.rebuildBoardCallback = () => createBoard(mineSweeper);

    createBoard(mineSweeper);

    game.style.opacity = 1;
};



rows.addEventListener('change', start);
cols.addEventListener('change', start);
mines.addEventListener('change', start);
reset.addEventListener('click', start);
messageButton.addEventListener('click', start);

start();
