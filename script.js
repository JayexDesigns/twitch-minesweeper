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

const forms = document.getElementsByTagName("form");
for (let form of forms) form.addEventListener('submit', (e) => e.preventDefault());

const themeButton = document.getElementById("theme-toggle");
let currentTheme = "light";
themeButton.addEventListener('click', () => {
    let root = document.querySelector(':root');
    if (currentTheme === "light") {
        currentTheme = "dark";
        themeButton.classList.remove("fa-sun");
        themeButton.classList.add("fa-moon");
        root.style.setProperty('--background-color', '#1a1a1a');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--config-background-color', '#1a1a1a');
        root.style.setProperty('--config-text-color', '#ffffff');
        root.style.setProperty('--config-shadow-color', '#ffffff20');
        root.style.setProperty('--game-tile-color', '#666666');
        root.style.setProperty('--game-tile-hover-color', '#888888');
        root.style.setProperty('--game-tile-hovering', '#cccccc');
        root.style.setProperty('--game-tile-hovering-revealed', '#444444');
        root.style.setProperty('--game-icons-color', '#ffffff');
        root.style.setProperty('--message-background-color', '#1a1a1a');
        root.style.setProperty('--message-text-color', '#ffffff');
        root.style.setProperty('--message-shadow-color', '#ffffff20');
        root.style.setProperty('--twitch-controls-background-color', '#000000b0');
        root.style.setProperty('--twitch-controls-text-color', '#ffffff');
    }
    else if (currentTheme === "dark") {
        currentTheme = "light";
        themeButton.classList.remove("fa-moon");
        themeButton.classList.add("fa-sun");
        root.style.setProperty('--background-color', '#ffffff');
        root.style.setProperty('--text-color', '#424242');
        root.style.setProperty('--config-background-color', '#ffffff');
        root.style.setProperty('--config-text-color', '#424242');
        root.style.setProperty('--config-shadow-color', '#42424220');
        root.style.setProperty('--game-tile-color', '#cccccc');
        root.style.setProperty('--game-tile-hover-color', '#eeeeee');
        root.style.setProperty('--game-tile-hovering', '#777777');
        root.style.setProperty('--game-tile-hovering-revealed', '#eeeeee');
        root.style.setProperty('--game-icons-color', '#424242');
        root.style.setProperty('--message-background-color', '#ffffff');
        root.style.setProperty('--message-text-color', '#424242');
        root.style.setProperty('--message-shadow-color', '#42424220');
        root.style.setProperty('--twitch-controls-background-color', '#000000b0');
        root.style.setProperty('--twitch-controls-text-color', '#ffffff');
    }
});





// Creates All The DOM Elements That Corresponds To The Board, Including Mines And Flags That Are Hidden At Start
const createBoard = (mineSweeper) => {
    gameCanvas.innerHTML = ``;

    gameCanvas.style.gridTemplateColumns = `repeat(${colsInput.value}, 1fr)`;

    for (let i = 0; i < mineSweeper.rows; ++i) {
        for (let j = 0; j < mineSweeper.cols; ++j) {
            // Creates All The Tiles
            let tile = document.createElement("div");
            tile.classList.add("game-tile");
            tile.id = `game-tile-${i}-${j}`;
            tile.addEventListener('mousedown', (e) => tileClickHandler(e, i, j));
            tile.addEventListener('contextmenu', (e) => e.preventDefault(), false);
            gameCanvas.appendChild(tile);

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
    if (e.preventDefault) e.preventDefault();

    // Left Click Will Remove The Tile If Successful, If Not It Won't Do Nothing
    if (e.button === 0) {
        mineSweeper.revealTile(i, j, true);
    }

    // Right Click Will Show The Flag If The Tile Is Not Revealed And Hide It If There Was Already A Flag
    else if (e.button === 2) {
        mineSweeper.toggleFlag(i, j);
    }
};





const gameCanvas = document.getElementById("game");
const rowsInput = document.getElementById("config-rows");
const colsInput = document.getElementById("config-cols");
const minesInput = document.getElementById("config-mines");
const minesLeft = document.getElementById("game-mines-left");
const resetButton = document.getElementById("config-reset");
const messageBox = document.getElementById("message");
const messageText = document.getElementById("message-text");
const messageButton = document.getElementById("message-button");
let mineSweeper;

// When The Function Start All The Game Resets
const start = () => {
    // Initial Position For The End Game Message
    messageBox.style.visibility = "hidden";
    messageBox.style.opacity = "0";
    messageBox.style.top = "40%";

    // Sanitize Inputs
    let rows = rowsInput.value;
    let cols = colsInput.value;
    if (rows < 2) {
        rows = 2;
        rowsInput.value = rows;
    }
    if (cols < 2) {
        cols = 2;
        colsInput.value = cols;
    }

    let mines = minesInput.value;
    if (mines < 1) {
        mines = 1;
        minesInput.value = mines;
    }
    else if (mines >= rows * cols) {
        mines = (rows * cols) - 1;
        minesInput.value = mines;
    }

    // Creates The Game
    mineSweeper = new Game(rows, cols, mines);

    // Places The Mines In Random Places (Later In First Reveal The Board Will Be Displaced)
    mineSweeper.placeMines();
    mineSweeper.setNearMinesTiles();

    minesLeft.innerText = `Mines Left: ${mineSweeper.mines - mineSweeper.countFlags()}`;

    if (twitchActionCallback) twitchActionCallback(mineSweeper, "start");

    // This Callback Is Executed When The Game Ends And The Player Lost (Shows All The Mines)
    mineSweeper.loseCallback = (row, col) => {
        if (twitchActionCallback) twitchActionCallback(mineSweeper, "lose");
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
        messageBox.style.visibility = "visible";
        messageBox.style.opacity = "1";
        messageBox.style.top = "50%";
    };

    // This Callback Is Executed When The Game Ends And The Player Won
    mineSweeper.winCallback = (row, col) => {
        if (twitchActionCallback) twitchActionCallback(mineSweeper, "win");
        minesLeft.innerText = `Mines Left: 0`;
        let flags = document.getElementsByClassName("game-tile-flag");
        for (let flag of flags) {
            flag.classList.remove("game-shown");
            flag.classList.add("game-hidden");
        }
        messageText.innerText = "You Won!";
        messageBox.style.visibility = "visible";
        messageBox.style.opacity = "1";
        messageBox.style.top = "50%";
    };

    // This Callback Is Executed When A Tile Is Revealed So The Background Disapears And Shows The Number Behind It
    mineSweeper.revealCallback = (row, col) => {
        if (twitchActionCallback) twitchActionCallback(mineSweeper, "reveal");
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
        if (twitchActionCallback) twitchActionCallback(mineSweeper, "flag");
        let flag = document.getElementById(`game-tile-flag-${row}-${col}`);
        if (mineSweeper.board[row][col]["flag"]) {
            flag.classList.remove("game-hidden");
            flag.classList.add("game-shown");
        }
        else if (!mineSweeper.board[row][col]["flag"]) {
            flag.classList.remove("game-shown");
            flag.classList.add("game-hidden");
        }
        minesLeft.innerText = `Mines Left: ${mineSweeper.mines - mineSweeper.countFlags()}`;
    };

    // This Callback Is For Rebuilding The Board For When The Displacement Function Is Executed
    mineSweeper.rebuildBoardCallback = () => {
        createBoard(mineSweeper);
        if (twitchActionCallback) {
            twitchActionCallback(mineSweeper, "rebuild");
        }
    }

    mineSweeper.rebuildBoardCallback();
    // createBoard(mineSweeper);

    gameCanvas.style.opacity = 1;
};



rowsInput.addEventListener('change', start);
colsInput.addEventListener('change', start);
minesInput.addEventListener('change', start);
resetButton.addEventListener('click', start);
messageButton.addEventListener('click', start);

start();
