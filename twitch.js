const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const enableTwitch = document.getElementById("config-enable-twitch");
const twitchUsername = document.getElementById("config-username");
const twitchUsernameInput = document.getElementById("config-username-input");
const modeDemocracy = document.getElementById("config-mode-democracy");
const modeDemocracyInput = document.getElementById("config-mode-democracy-input");
const modeDemocracyVotes = document.getElementById("config-mode-democracy-votes");
const modeDemocracyVotesInput = document.getElementById("config-mode-democracy-votes-input");
const modeChaos = document.getElementById("config-mode-chaos");
const modeChaosInput = document.getElementById("config-mode-chaos-input");
const twitchControls = document.getElementById("twitch-controls");

let twitchActionCallback = (mineSweeper, action) => {};
let username = "";
let votesToAction = 20;
let hosts = ["Jayex_Designs"];
let client;

let changeVotesCallback = (votes) => {};
const changeVotes = (votes) => {
    if (votes < 1 || isNaN(votes)) votes = 1;
    votesToAction = votes;
    changeVotesCallback(votes);
};

enableTwitch.addEventListener('change', (e) => {
    if (!e.target.checked) {
        username = "";
        twitchUsernameInput.value = "";
        twitchUsername.style.visibility = "hidden";
        modeDemocracy.style.visibility = "hidden";
        modeDemocracyVotes.style.visibility = "hidden";
        modeChaos.style.visibility = "hidden";
        twitchControls.style.visibility = "hidden";
        modeDemocracyInput.checked = true;
    }
    else {
        twitchUsername.style.visibility = "visible";
        modeDemocracy.style.visibility = "visible";
        modeDemocracyVotes.style.visibility = "visible";
        modeChaos.style.visibility = "visible";
    }
});

modeDemocracyInput.addEventListener('change', (e) => {
    if (e.target.checked) changeVotes(parseInt(modeDemocracyVotesInput.value));
});

modeDemocracyVotesInput.addEventListener('input', (e) => {
    modeDemocracyInput.checked = true;
    changeVotes(parseInt(modeDemocracyVotesInput.value));
});

modeChaosInput.addEventListener('change', (e) => {
    if (e.target.checked) changeVotes(1);
});

twitchUsernameInput.addEventListener('input', (e) => {
    username = e.target.value;
});

twitchUsernameInput.addEventListener('change', (e) => {
    client = new tmi.client({
        connection: {
            reconnect: true,
            secure: true,
        },
        channels: [username],
    });
    if (username.toLowerCase() === "natsumiii") {
        currentTheme = "natsumiii";
        changeTheme();
    }
    else if (username.toLowerCase() === "sunixdx") {
        currentTheme = "sunixdx";
        changeTheme();
    }
    client.connect();
    startTwitchPlaymode();
    twitchControls.style.visibility = "visible";
});



const startTwitchPlaymode = () => {
    twitchControls.innerHTML = ``;

    const controlLeft = document.createElement("p");
    const controlRight = document.createElement("p");
    const controlUp = document.createElement("p");
    const controlDown = document.createElement("p");
    const controlReveal = document.createElement("p");
    const controlFlag = document.createElement("p");
    const controlPlay = document.createElement("p");
    controlPlay.classList.add("twitch-control-play-action");
    twitchControls.appendChild(controlLeft);
    twitchControls.appendChild(controlRight);
    twitchControls.appendChild(controlUp);
    twitchControls.appendChild(controlDown);
    twitchControls.appendChild(controlReveal);
    twitchControls.appendChild(controlFlag);
    twitchControls.appendChild(controlPlay);

    let position = [0, 0];

    const getFirstPossiblePosition = () => {
        let pos = [];
        for (let i = 0; i < mineSweeper.rows && i > -1; ++i) {
            for (let j = 0; j < mineSweeper.cols && j > -1; ++j) {
                if (!mineSweeper.board[i][j]["revealed"]) {
                    pos = [i, j];
                    i = -2;
                    j = -2;
                }
            }
        }
        return pos;
    }

    const setPosition = (row, col) => {
        let previousTile = document.getElementById(`game-tile-background-${position[0]}-${position[1]}`);
        previousTile.classList.remove("game-tile-hovering");
        previousTile = document.getElementById(`game-tile-${position[0]}-${position[1]}`);
        previousTile.classList.remove("game-tile-hovering-revealed");

        if (!mineSweeper.board[row][col]["revealed"]) {
            let tile = document.getElementById(`game-tile-background-${row}-${col}`);
            tile.classList.add("game-tile-hovering");
        }
        else {
            let tile = document.getElementById(`game-tile-${row}-${col}`);
            tile.classList.add("game-tile-hovering-revealed");
        }
        position = [row, col];
    };
    let pos = getFirstPossiblePosition();
    setPosition(pos[0], pos[1]);

    const checkDirection = (x, y) => {
        let pos = [position[0] + x, position[1] + y];
        if (pos[0] < 0) pos[0] = mineSweeper.rows - 1;
        else if (pos[0] >= mineSweeper.rows) pos[0] = 0;
        if (pos[1] < 0) pos[1] = mineSweeper.cols - 1;
        else if (pos[1] >= mineSweeper.cols) pos[1] = 0;
        return pos;
    };

    twitchActionCallback = (mineSweeper, action) => {
        if (action === "lose" || action === "win" || action === "start") {
            if (votes["users"].length > 0) {
                let users = votes["users"].reverse();
                if (users.length > 3) users =  users.slice(0, 3);
                messageText.innerText = `You Lost!\nLast Action Made By:\n${users.join(", ")}`;
            }
            resetVotes();
        }
        else if (action === "rebuild") {
            let pos = getFirstPossiblePosition();
            setPosition(pos[0], pos[1]);
        }
        else if (action === "reveal") {
            setPosition(position[0], position[1]);
        }
    };

    let votes = {
        "left": 0,
        "right": 0,
        "up": 0,
        "down": 0,
        "reveal": 0,
        "flag": 0,
        "play": 0,
        "users": [],
    }

    const resetVotes = () => {
        for (let vote in votes) {
            if (vote === "users") votes[vote] = [];
            else votes[vote] = 0;
        }
        showVotes();
    };

    let options = {
        "left": () => {
            if (!mineSweeper.gameEnded) ++votes["left"];
            showVotes();
            if (votes["left"] >= votesToAction) {
                let pos = checkDirection(0, -1);
                setPosition(pos[0], pos[1]);
                resetVotes();
            }
        },
        "right": () => {
            if (!mineSweeper.gameEnded) ++votes["right"];
            showVotes();
            if (votes["right"] >= votesToAction) {
                let pos = checkDirection(0, 1);
                setPosition(pos[0], pos[1]);
                resetVotes();
            }
        },
        "up": () => {
            if (!mineSweeper.gameEnded) ++votes["up"];
            showVotes();
            if (votes["up"] >= votesToAction) {
                let pos = checkDirection(-1, 0);
                setPosition(pos[0], pos[1]);
                resetVotes();
            }
        },
        "down": () => {
            if (!mineSweeper.gameEnded) ++votes["down"];
            showVotes();
            if (votes["down"] >= votesToAction) {
                let pos = checkDirection(1, 0);
                setPosition(pos[0], pos[1]);
                resetVotes();
            }
        },
        "reveal": () => {
            if (!mineSweeper.gameEnded) ++votes["reveal"];
            showVotes();
            if (votes["reveal"] >= votesToAction) {
                tileClickHandler({"button": 0}, position[0], position[1]);
                resetVotes();
            }
        },
        "flag": () => {
            if (!mineSweeper.gameEnded) ++votes["flag"];
            showVotes();
            if (votes["flag"] >= votesToAction) {
                tileClickHandler({"button": 2}, position[0], position[1]);
                resetVotes();
            }
        },
        "play": () => {
            if (mineSweeper.gameEnded) ++votes["play"];
            showVotes();
            if ((votesToAction < 5 && votes["play"] >= 5) || (votesToAction >= 5 && votes["play"] >= votesToAction)) {
                start();
                resetVotes();
            }
        },
    };

    const showVotes = () => {
        if (!mineSweeper.gameEnded) {
            controlLeft.innerText = `left: ${votes["left"]}/${votesToAction}`;
            controlRight.innerText = `right: ${votes["right"]}/${votesToAction}`;
            controlUp.innerText = `up: ${votes["up"]}/${votesToAction}`;
            controlDown.innerText = `down: ${votes["down"]}/${votesToAction}`;
            controlReveal.innerText = `reveal: ${votes["reveal"]}/${votesToAction}`;
            controlFlag.innerText = `flag: ${votes["flag"]}/${votesToAction}`;
            controlLeft.style.visibility = "visible";
            controlRight.style.visibility = "visible";
            controlUp.style.visibility = "visible";
            controlDown.style.visibility = "visible";
            controlReveal.style.visibility = "visible";
            controlFlag.style.visibility = "visible";
            controlPlay.style.visibility = "hidden";
        }
        else {
            controlPlay.innerText = `play: ${votes["play"]}/${votesToAction < 5 ? 5 : votesToAction}`;
            controlLeft.style.visibility = "hidden";
            controlRight.style.visibility = "hidden";
            controlUp.style.visibility = "hidden";
            controlDown.style.visibility = "hidden";
            controlReveal.style.visibility = "hidden";
            controlFlag.style.visibility = "hidden";
            controlPlay.style.visibility = "visible";
        }
        twitchControls
    };

    changeVotesCallback = () => showVotes();
    showVotes();

    client.on('message', (channel, tags, message, self) => {
        console.log(`${tags["display-name"]}: ${message}`);
        if (options[message]) {
            let user = tags["display-name"];
            if (user === channel || hosts.includes(user) || !votes["users"].includes(user)) {
                votes["users"].push(tags["display-name"]);
                options[message]();
            }
        }
    });
};
