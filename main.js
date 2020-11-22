const gameDiv = document.querySelector("#game");
const playersNumber = document.querySelector("#players_number");
const gameMode = document.querySelector("#game_mod");
const specialOptions = document.querySelector("#special_options");
const rules = document.querySelector("#rules");
const showRules = document.querySelector("#show_rules");
const level = document.querySelector("#level");
const existSetCheckbox = document.querySelector("#exist_set_checkbox");
const findSetCheckbox = document.querySelector("#find_set_checkbox");
const addCardsCheckbox = document.querySelector("#add_cards_checkbox");
const play = document.querySelector("#play");
const tableContainer = document.querySelector('#table-container');
const playersContainer = document.querySelector('#players');
const existSetButton = document.querySelector("#exist_set_button");
const findSetButton = document.querySelector("#find_set_button");
const addCardsButton = document.querySelector("#add_cards_button");
const result = document.querySelector("#result");
const deckContainer = document.querySelector("#deck");
const playersInput = document.querySelector("#players_input");
const timerOutput = document.querySelector("#timer");
const scoreOutput = document.querySelector("#score");
const remainingCardsCountDown = document.querySelector("#remainingCards");
const top10normalDiv = document.querySelector("#top10normal1");
const top10hardDiv = document.querySelector("#top10hard1");
const top10moreDiv = document.querySelector("#top10more");
const summaryScoreDiv = document.querySelector("#summaryScore");
const endDiv = document.querySelector("#end");

let top10normalDivData = JSON.parse(localStorage.getItem("top10normal1"));
let top10hardDivData = JSON.parse(localStorage.getItem("top10hard1"));
let top10moreData = JSON.parse(localStorage.getItem("top10more"));
let timer = 0;
let gameStatus = null;

const shapes = {
    DIAMOND: {codeNumb: 1, english: "diamond", code: 'D'},
    OVAL: {codeNumb: 2, english: "oval", code: 'P'},
    SQUIGGLE: {codeNumb: 3, english: "squiggle", code: 'S'}
};

const colors = {
    GREEN: {codeNumb: 1, english: "green", code: 'g'},
    PURPLE: {codeNumb: 2, english: "purple", code: 'p'},
    RED: {codeNumb: 3, english: "red", code: 'r'}
};

const fills = {
    SOLID: {codeNumb: 1, english: "solid", code: "S",},
    STRIPPED: {codeNumb: 2, english: "stripped", code: "H"},
    OPEN: {codeNumb: 3, english: "open", code: "O"}
};

class Player {
    constructor(name) {
        this._name = name;
        this._point = 0;
        this._selected = 0;
    }

    get name() {
        return this._name;
    }

    get point() {
        return this._point;
    }

    get selected() {
        return this._selected;
    }

    select() {
        this._selected = 1;
    }

    unselect() {
        this._selected = 0;
    }

    setInactive() {
        this._selected = -1;
    }

    pointIncreasing() {
        this._point += 1;
    }

    pointDecreasing() {
        this._point -= 1;
    }
}

class Card {
    constructor(shape, color, number, fill, id, codeNumb) {
        this._selected = 0;
        this._shape = shape;
        this._color = color;
        this._number = number;
        this._fill = fill;
        this._id = id;
        this._codeNumb = codeNumb;
    }

    get codeNumb() {
        return this._codeNumb;
    }

    get shape() {
        return this._shape;
    }

    get color() {
        return this._color;
    }

    get fill() {
        return this._fill;
    }

    get selected() {
        return this._selected;
    }

    select() {
        this._selected = 1;
    }

    back() {
        this._selected = 0;
    }

    get id() {
        return this._id;
    }

    writeToConsole() {
        console.log(`id = ${this._id} number = ${this._number} form = ${this._shape} color = ${this._color} fill = ${this._fill} selected = ${this._selected}`);
    }
}

const deck = {
    remainingCards: [],
    cardsOnTable: [],
    selectedCards: [],

    init: function () {
        this.generateDeck();
        this.remainingCards.forEach(element => element.writeToConsole());
        this.shuffle();
        for (let i = 0; i < 12; i++) {
            const temp = this.remainingCards.pop();
            this.cardsOnTable.push(temp);
        }
        this.createTable();
        if (deck.existSetOnTable().length === 0 && addCardsCheckbox.checked) {
            this.addCardsToTable();
        }
        deckContainer.classList.remove("hide");
    },
    createTable: function () {
        tableContainer.innerHTML = "";
        const table = document.createElement('table');
        const tdNumber = this.cardsOnTable.length / 3;
        let sum = 1;
        let row = document.createElement('tr');
        this.cardsOnTable.forEach(function (cardOnTable) {
            const cell = document.createElement('td');
            cell.innerHTML = `<img class="card" src=./icons/${cardOnTable.id}.svg alt=${cardOnTable.id}>`;
            row.appendChild(cell);
            cell.firstChild.addEventListener("click", selectCardHandle);
            if (sum % tdNumber === 0) {
                table.appendChild(row);
                row = document.createElement('tr');
            }
            sum++;
        });
        tableContainer.appendChild(table);
    },
    generateDeck: function () {
        for (let i = 1; i < 4; ++i) {
            for (const shape in shapes) {
                for (const color in colors) {
                    if (level.value === "hard") {
                        for (const fill in fills) {
                            const card = new Card(shape, color, i, fill, `${i}${fills[fill].code}${colors[color].code}${shapes[shape].code}`, [i, fills[fill].codeNumb, colors[color].codeNumb, shapes[shape].codeNumb]);
                            this.remainingCards.push(card);
                        }
                    } else {
                        const card = new Card(shape, color, i, "SOLID", `${i}${fills["SOLID"].code}${colors[color].code}${shapes[shape].code}`, [i, fills["SOLID"].codeNumb, colors[color].codeNumb, shapes[shape].codeNumb]);
                        this.remainingCards.push(card);
                    }
                }
            }
        }
    },
    shuffle: function () {
        for (let i = this.remainingCards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            let temp = this.remainingCards[i];
            this.remainingCards[i] = this.remainingCards[j];
            this.remainingCards[j] = temp;
        }
    },
    reset: function () {
        this.remainingCards = [];
        this.cardsOnTable = [];
        this.resetSelectedCards();
        tableContainer.innerHTML = "";
    },
    addSelectedCards: function (card) {
        this.selectedCards.push(card);
        card.select();
    },
    /**
     *
     * @param card
     */
    removeSelectedCards: function (card) {
        this.selectedCards = arrayRemove(this.selectedCards, card);
        card.back();
    },
    resetSelectedCards: function () {
        this.selectedCards = [];
        let temp = document.querySelectorAll(".card");
        temp.forEach(elem => elem.classList.remove("selectCard"));
    },
    /**
     * add 3 cards to table
     */
    addCardsToTable: function () {
        if (this.remainingCards.length !== 0) {
            for (let i = 0; i < 3; i++) {
                const temp = this.remainingCards.pop();
                this.cardsOnTable.push(temp);
            }
            this.createTable();
            if (this.remainingCards.length === 0) {
                deckContainer.classList.add("hide");
            }
            if (deck.existSetOnTable().length === 0) {
                this.addCardsToTable();
            }
        }
        remainingCardsCountDown.innerHTML = `${deck.remainingCards.length} kártya maradt a pakliban`;
    },
    /**
     * Drop cards from table
     * @param cards
     */
    dropCardsFromTable: function (cards) {
        const actualTable = document.querySelectorAll('#table-container img');
        for (let k = 0; k < cards.length; ++k) {
            for (let i = 0; i < actualTable.length; ++i) {
                if (actualTable[i].alt === cards[k].id) {
                    actualTable[i].closest('td').innerHTML = "";
                }
            }
            this.cardsOnTable = arrayRemove(this.cardsOnTable, cards[k]);
        }
        this.createTable();
    },

    existSetOnTable: function () {
        for (let i = 0; i < this.cardsOnTable.length; i++) {
            for (let j = 0; j < this.cardsOnTable.length; j++) {
                for (let k = 0; k < this.cardsOnTable.length; k++) {
                    if (this.cardsOnTable[i].id !== this.cardsOnTable[j].id && this.cardsOnTable[j].id !== this.cardsOnTable[k].id && this.cardsOnTable[i].id !== this.cardsOnTable[k].id) {
                        const temp = [this.cardsOnTable[i], this.cardsOnTable[j], this.cardsOnTable[k]];
                        if (game.isSet(temp)) {
                            return temp;
                        }
                    }
                }
            }
        }
        return [];
    }
};

const game = {
    players: [],
    existSelected: {number: 0, player: null},

    /**
     *  When the game starts, this program generates the board based on the general settings
     */
    init: function () {
        endDiv.innerHTML = "";
        gameStatus = 1;
        deck.init();
        this.createPlayers();
        this.writePlayers();
        if (parseInt(playersNumber.value) === 1 && gameMode.value === "competitive") {
            startTimer();
        }
        remainingCardsCountDown.innerHTML = `${deck.remainingCards.length} kártya maradt a pakliban`;
    },
    /**
     * Generates all players according to the data set in the general settings
     */
    createPlayers: function () {
        const playersFromPage = document.querySelectorAll("#players_input input");
        for (let i = 0; i < playersFromPage.length; ++i) {
            this.players.push(new Player(playersFromPage[i].value));
        }
    },
    /**
     * Displays all players along with their current points
     */
    writePlayers: function () {
        const table = document.createElement('table');
        const playerColumnNameHead = document.createElement('th');
        const playerHeadRow = document.createElement('tr');

        playerColumnNameHead.innerHTML = 'Név';

        playerHeadRow.appendChild(playerColumnNameHead);

        table.appendChild(playerHeadRow);

        for (let i = 0; i < parseInt(playersNumber.value); ++i) {
            const playerLine = document.createElement('tr');
            const playerColumnName = document.createElement('td');

            playerColumnName.innerHTML = `<button type = button class ="box btn-blue">${this.players[i].name}</button>`;

            playerLine.appendChild(playerColumnName);
            table.appendChild(playerLine)
            if (parseInt(playersNumber.value) > 1) {
                this.players[i].unselect();
            }
        }
        playersContainer.innerHTML = "";
        playersContainer.appendChild(table);

        if (parseInt(playersNumber.value) === 1) {
            document.querySelector("#players td:nth-child(1) button").classList.add("selectPlayer");
            this.setExistSelect(this.players[0]);

            remainingCardsCountDown.innerHTML = `${deck.remainingCards.length} kártya maradt a pakliban`;
        }
        this.writeScore();
    },

    writeScore: function () {
        const sortedPlayers = this.players.slice().sort(function (a, b) {
            return b.point - a.point;
        });

        const table = createScoreBoard(sortedPlayers, 'Aktuális pontszám', "Pont");

        const data = [];

        for (let i = 0; i < sortedPlayers.length; ++i) {
            data.push({name: sortedPlayers[i].name, point: sortedPlayers[i].point});
        }
        ;

        localStorage.setItem("actualGameResult", JSON.stringify(data));

        summaryScoreDiv.innerHTML = "";
        scoreOutput.innerHTML = "";
        scoreOutput.appendChild(table);

        if (parseInt(playersNumber.value) > 1) {
            const lastGameResult = JSON.parse(sessionStorage.getItem("lastGameResult"));
            const lastData = lastGameResult === null ? data : summaryScore(data, lastGameResult);
            const table2 = createScoreBoard(lastData, 'Összesített pontszám', "Pont");
            summaryScoreDiv.appendChild(table2);
        }

    },

    /**
     * reset all game statement
     */
    reset: function () {
        this.players = [];
        deck.reset();
        playersContainer.innerHTML = "";
        this.existSelected.number = 0;
        this.existSelected.player = null;
    },

    /**
     * This function unselect the selected player. Good tip can be true or false.
     * @param goodTip
     */
    unselectPlayer: function (goodTip) {
        if (goodTip) {
            this.existSelected.player.unselect();
        } else {
            this.existSelected.player.setInactive();
        }
        game.notExistSelect();
        const activePlayer = document.querySelector(".selectPlayer");
        activePlayer.classList.remove("selectPlayer");

        let existsActivePlayer = false;

        for (let i = 0; i < game.players.length && !existsActivePlayer; ++i) {
            if (game.players[i].selected !== -1) {
                existsActivePlayer = true;
            }
        }
        if (!existsActivePlayer) {
            game.writePlayers();
        }
    },
    /**
     * storage the selected player
     * @param player
     */
    setExistSelect: function (player) {
        this.existSelected.number = 1;
        this.existSelected.player = player;
        this.existSelected.player.select();
    },
    /**
     * clear the selected player
     */
    notExistSelect: function () {
        this.existSelected.number = 0;
        this.existSelected.player = null;
    },
    /**
     * It tells you that the array containing the specified cards is in SET with each other
     * @param cards
     * @returns {boolean}
     */
    isSet: function (cards) {
        const isSet = [...cards[0].codeNumb];
        for (let j = 0; j < isSet.length; j++) {
            for (let i = 1; i < 3; i++) {
                isSet[j] += cards[i].codeNumb[j];
                if (i === 2 && isSet[j] % 3 !== 0) {
                    return false;
                }
            }
        }
        return true;
    }
};

showRules.addEventListener("click", function () {
    rules.style.display = "block";
});

window.addEventListener("click", function (event) {
    if (event.target === rules) {
        rules.style.display = "none";
    }
});

rules.addEventListener("click", function () {
    rules.style.display = "none";
});

document.addEventListener("click", function (event) {
    if (event.target.matches(".close")) {
        stopCountDown();
        event.target.closest(".modal").style.display = "none";
        game.reset();
        sessionStorage.clear();
    }
});

playersNumber.addEventListener("keypress", function (event) {
    event.preventDefault();
});

playersNumber.addEventListener("input", function (event) {
    playersInput.innerHTML = "";
    for (let i = 1; i <= parseInt(event.target.value); ++i) {
        playersInput.innerHTML += `<label for="players_input_${i}">${i}. játékos: </label><input id="players_input_${i}" type="text" max="50" min="1" value="Játékos${i}" order_number = ${i}><br>`;
    }
});

gameMode.addEventListener("change", function (event) {
    if (event.target.value === "competitive") {
        specialOptions.classList.add("hide");
        existSetButton.classList.add("hide");
        findSetButton.classList.add("hide");
        addCardsButton.classList.add("hide");
        existSetCheckbox.checked = false;
        findSetCheckbox.checked = false;
        addCardsCheckbox.checked = true;
    }
    if (event.target.value === "practice") {
        specialOptions.classList.remove("hide");
        existSetButton.classList.remove("hide");
        findSetButton.classList.remove("hide");
        addCardsButton.classList.remove("hide");
    }
});

play.addEventListener("click", function () {
    gameDiv.style.display = "block";
    game.init();
});

addCardsButton.addEventListener('click', deck.addCardsToTable.bind(deck));
existSetButton.addEventListener("click", function () {
    const exist = deck.existSetOnTable();
    result.innerHTML = (exist.length !== 0) ? "Van benne SET" : "Nincs benne SET";
    setTimeout(function () {
        result.innerHTML = "";
    }, 5000);
});

findSetButton.addEventListener("click", function () {

    const cardsOnTable = document.querySelectorAll(".card")
    const cardsInSet = deck.existSetOnTable();
    if (cardsInSet) {
        cardsInSet.forEach(function (card) {
            for (let i = 0; i < cardsOnTable.length; ++i) {
                if (card.id === cardsOnTable[i].alt) {
                    cardsOnTable[i].classList.add("set");
                }
            }
        })
    }
});
existSetCheckbox.addEventListener("change", function () {
    if (!existSetCheckbox.checked) {
        existSetButton.classList.add("hide");
    }
    if (existSetCheckbox.checked) {
        existSetButton.classList.remove("hide");
    }
})
findSetCheckbox.addEventListener("change", function () {
    if (!findSetCheckbox.checked) {
        findSetButton.classList.add("hide");
    }
    if (findSetCheckbox.checked) {
        findSetButton.classList.remove("hide");
    }
})
addCardsCheckbox.addEventListener("change", function () {
    if (!addCardsCheckbox.checked) {
        addCardsButton.classList.remove("hide");
    }
    if (addCardsCheckbox.checked) {
        addCardsButton.classList.add("hide");
    }
})

delegate(playersInput, "focusout", "input", function (event) {
    if (event.target.value === "") {
        event.target.value = `Játékos${event.target.getAttribute("order_number")}`
    }
});

delegate(playersContainer, "click", 'tr td:nth-child(1) button', function (event) {

    const activePlayer = event.target;
    let player = game.players.find(element => element.name === activePlayer.innerText);
    if (parseInt(playersNumber.value) > 1 && player.selected === 0 && !game.existSelected.player && gameStatus) {
        game.setExistSelect(player);
        activePlayer.classList.add("selectPlayer");
        startCountDown();
    }
});

function arrayRemove(array, value) {
    return array.filter(function (elem) {
        return elem !== value;
    });
}

function selectCardHandle(event) {
    if (deck.selectedCards.length < 3 && game.existSelected.number && gameStatus) {

        let card = deck.cardsOnTable.find(element => element.id === event.target.alt);
        if (!card.selected) {
            event.target.classList.remove("set");
            event.target.classList.add("selectCard");
            deck.addSelectedCards(card);
        } else {
            event.target.classList.remove("selectCard");
            deck.removeSelectedCards(card);
        }
    }

    if (deck.selectedCards.length === 3) {
        const isSet = game.isSet(deck.selectedCards);
        if (parseInt(playersNumber.value) > 1 && gameStatus) {
            document.querySelector(".selectPlayer").classList.add("inactivePlayer");
        }

        if (isSet) {
            game.existSelected.player.pointIncreasing();
            deck.dropCardsFromTable(deck.selectedCards);
            deck.resetSelectedCards();
            if (parseInt(playersNumber.value) > 1) {
                game.unselectPlayer(true);
            }
            game.writePlayers();
            if ((deck.cardsOnTable.length < 12 || deck.existSetOnTable().length === 0) && addCardsCheckbox.checked) {
                deck.addCardsToTable();
            }
        } else {
            game.existSelected.player.pointDecreasing();
            deck.selectedCards.forEach(elem => elem.back());
            deck.resetSelectedCards();
            if (parseInt(playersNumber.value) > 1) {
                game.unselectPlayer(false);
            }
        }
        result.innerHTML = isSet ? "Hurrá, egy Set" : "Sajnos ez Nem Set";
        setTimeout(function () {
            result.innerHTML = "";
        }, 5000);
        if (parseInt(playersNumber.value) > 1) {
            stopCountDown();
        }

        if (deck.existSetOnTable().length === 0 && deck.remainingCards.length === 0) {
            gameStatus = 0;
            game.writeScore();
            endDiv.innerHTML = "A játéknak vége.";
            storeData();
            stopTimer();
            if (parseInt(playersNumber.value) > 1) {
                endDiv.innerHTML = `Akartok újra együtt játszani? <div class="box"><button id = "again" type = button class = " smallbutton" value="yes">Yes</button></div> <div class="box"><button id = "closeButton" type = button class = "smallbutton" value="no">No</button></div>`;
                document.querySelector("#again").addEventListener("click", function () {
                    const actualGameResult = JSON.parse(localStorage.getItem("actualGameResult"));
                    const lastGameResult = JSON.parse(sessionStorage.getItem("lastGameResult"));
                    const lastData = lastGameResult === null ? actualGameResult : summaryScore(actualGameResult, lastGameResult);
                    sessionStorage.setItem("lastGameResult", JSON.stringify(lastData))
                    game.reset();
                    game.init();
                });
                document.querySelector("#closeButton").addEventListener("click", function () {
                    stopCountDown();
                    gameDiv.style.display = "none";
                    game.reset();
                    sessionStorage.clear();
                });
            }
        } else {
            game.writeScore();
        }
    }
}

function delegate(parent, type, selector, handler) {
    parent.addEventListener(type, function (event) {
        const targetElement = event.target.closest(selector);
        if (this.contains(targetElement)) {
            handler.call(targetElement, event);
        }
    })
}


/**
 *
 */
function startCountDown() {
    let timeleft = 0;
    timer = setInterval(function () {
            timerOutput.innerHTML = `${10 - timeleft}`;
            if (timeleft >= 10) {
                document.querySelector(".selectPlayer").classList.add("inactivePlayer");
                clearInterval(timer);
                game.existSelected.player.pointDecreasing();
                game.unselectPlayer();
                deck.resetSelectedCards();
                game.writeScore();

                setTimeout(function () {
                    timerOutput.innerHTML = "";
                }, 1000);
            }
            timeleft += 1;
        }
        , 1000
    );
}

function startTimer() {
    let timeleft = 0;
    timer = setInterval(function () {
            timerOutput.innerHTML = `${timeleft}`;
            timeleft += 1;
        }
        , 1000
    );
}

function stopCountDown() {
    clearTimeout(timer);
    setTimeout(function () {
        timerOutput.innerHTML = "";
    }, 1000);
}

function stopTimer() {
    timer = timer;
    clearTimeout(timer);
}

top10normalDiv.appendChild(createScoreBoard(top10normalDivData ? top10normalDivData : [{
    name: "Nincs adat",
    point: "Nincs adat"
}], "TOP 10 Egy játékos mód [KÖNNYŰ]", "Idő"));
top10hardDiv.appendChild(createScoreBoard(top10hardDivData ? top10hardDivData : [{
    name: "Nincs adat",
    point: "Nincs adat"
}], "TOP 10 Egy játékos mód [NEHÉZ]", "Idő"));
top10moreDiv.appendChild(createScoreBoard(top10moreData ? top10moreData : [{
    name: "Nincs adat",
    point: "Nincs adat"
}], "TOP 10 Több játékos mód [KÖNNYŰ]", "Pont"));

function storeData() {
    const actualGame = JSON.parse(localStorage.getItem('actualGameResult'));

    if (parseInt(playersNumber.value) === 1 && gameMode.value === "competitive") {
        if (level.value === "normal") {
            top10normalDivData = top10normalDivData === null ? new Array({
                name: actualGame[0].name,
                timer: parseInt(timerOutput.innerText)
            }) : top10Score(actualGame, top10normalDivData);
            localStorage.setItem("top10normal1", JSON.stringify(top10normalDivData));

            top10normalDiv.innerHTML = "";
            top10normalDiv.appendChild(createScoreBoard(top10normalDivData ? top10normalDivData : [{
                name: "Nincs adat",
                point: "Nincs adat"
            }], "TOP 10 Egy játékos mód [KÖNNYŰ]", "Idő"));
        } else {
            top10hardDivData = top10hardDivData === null ? new Array({
                name: actualGame[0].name,
                timer: parseInt(timerOutput.innerText)
            }) : top10Score(actualGame, top10hardDivData);
            localStorage.setItem("top10hard1", JSON.stringify(top10hardDivData));

            top10hardDiv.innerHTML = "";
            top10hardDiv.appendChild(createScoreBoard(top10hardDivData ? top10hardDivData : [{
                name: "Nincs adat",
                point: "Nincs adat"
            }], "TOP 10 Egy játékos mód [NEHÉZ]", "Idő"));

        }
    } else {
        top10moreData = top10moreData === null ? actualGame : top10Score(actualGame, top10moreData);
        localStorage.setItem("top10more", JSON.stringify(top10moreData));

        top10moreDiv.innerHTML = "";
        top10moreDiv.appendChild(createScoreBoard(top10moreData ? top10moreData : [{
            name: "Nincs adat",
            point: "Nincs adat"
        }], "TOP 10 Több játékos mód [KÖNNYŰ]", "Pont"));
    }
}

function top10Score(actualGame, normalData) {
    for (let i = 0; i < actualGame.length; ++i) {
        let store = false;
        for (let j = 0; j < normalData.length; ++j) {
            if (actualGame[i].name === normalData[j].name) {
                store = true;
                if (parseInt(playersNumber.value) > 1) {
                    normalData[j].point = actualGame[i].point;
                } else {
                    normalData[j].timer = parseInt(timerOutput.innerText);
                }
            }
        }
        if (!store) {
            if (parseInt(playersNumber.value) > 1) {
                normalData.push(actualGame[i]);
            } else {
                const name = actualGame[i].name;
                normalData.push({name, timer: parseInt(timerOutput.innerText)});
            }
        }
    }
    normalData.sort(function (a, b) {
        return b[1] - a[1];
    });
    return normalData.slice(0, 10);
}
function summaryScore(actualGame, normalData) {
    for (let i = 0; i < actualGame.length; ++i) {
        let store = false;
        for (let j = 0; j < normalData.length; ++j) {
            if (actualGame[i].name === normalData[j].name) {
                store = true;
                if (parseInt(playersNumber.value) > 1) {
                    normalData[j].point += actualGame[i].point;
                } else {
                    normalData[j].timer += parseInt(timerOutput.innerText);
                }
            }
        }
        if (!store) {
            if (parseInt(playersNumber.value) > 1) {
                normalData.push(actualGame[i]);
            } else {
                const name = actualGame[i].name;
                normalData.push({name, timer: parseInt(timerOutput.innerText)});
            }
        }
    }
    normalData.sort(function (a, b) {
        return b[1] - a[1];
    });
    return normalData.slice(0, 10);
}


function createScoreBoard(data, name, secondC) {
    const caption = document.createElement('caption');
    caption.innerHTML = name;
    const table = document.createElement('table');
    const playerColumnRankHead = document.createElement('th');
    const playerColumnNameHead = document.createElement('th');
    const playerColumnPointHead = document.createElement('th');
    const playerHeadRow = document.createElement('tr');

    playerColumnRankHead.innerHTML = 'Rank';
    playerColumnNameHead.innerHTML = 'Név';
    playerColumnPointHead.innerHTML = secondC;

    playerHeadRow.appendChild(playerColumnRankHead);
    playerHeadRow.appendChild(playerColumnNameHead);
    playerHeadRow.appendChild(playerColumnPointHead);

    table.appendChild(caption);
    table.appendChild(playerHeadRow);

    for (let i = 0; i < data.length; ++i) {
        const playerLine = document.createElement('tr');
        const playerColumnRank = document.createElement('td');
        const playerColumnName = document.createElement('td');
        const playerColumnPoint = document.createElement('td');

        playerColumnRank.innerHTML = `${i + 1}`;
        playerColumnName.innerHTML = data[i].name;
        if (secondC === "Pont") {
            playerColumnPoint.innerHTML = data[i].point;
        } else {
            playerColumnPoint.innerHTML = data[i].timer;
        }

        playerLine.appendChild(playerColumnRank);
        playerLine.appendChild(playerColumnName);
        playerLine.appendChild(playerColumnPoint);
        table.appendChild(playerLine);
    }
    return table;
}

window.addEventListener('load', function () {
    sessionStorage.clear();
})