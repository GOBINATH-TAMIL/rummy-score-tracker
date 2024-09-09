// Array to store player data
let players = [];

// Current round number
let currentRound = 1;

// Set to track which players have entered score for the current round
let scoresEnteredThisRound = new Set();

// Score limit
let scoreLimit = null;

// Add event listener for Enter key on player name input and score input
document.addEventListener("DOMContentLoaded", function() {
    const playerNameInput = document.getElementById("player-name");
    const scoreValueInput = document.getElementById("score-value");

    // Allow Enter key to add player
    playerNameInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addPlayer();
        }
    });

    // Allow Enter key to add score
    scoreValueInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addScore();
        }
    });
});

// Function to add a player
function addPlayer() {
    // Prevent adding players after the game has started
    if (scoreLimit !== null) {
        alert("Cannot add players after the game has started.");
        return;
    }

    const playerNameInput = document.getElementById("player-name");
    const playerName = playerNameInput.value.trim();

    // Ensure the player name is not empty
    if (playerName === "") {
        alert("Please enter a valid player name.");
        return;
    }

    // Ensure player name is unique
    if (players.find(player => player.name.toLowerCase() === playerName.toLowerCase())) {
        alert("Player already exists.");
        return;
    }

    // Add player to the players array with initial values
    players.push({
        name: playerName,
        scores: [],
        total: 0,
        eliminated: false,
        eliminationNotified: false
    });

    // Clear the input field
    playerNameInput.value = "";

    // Update the scoreboard and player dropdown
    updateScoreboard();
    updatePlayerDropdown();
}

// Function to update the scoreboard
function updateScoreboard() {
    const scoreTableBody = document.querySelector("#score-table tbody");
    scoreTableBody.innerHTML = "";

    players.forEach(player => {
        const row = document.createElement("tr");

        // Player Name
        const nameCell = document.createElement("td");
        nameCell.textContent = player.name;
        row.appendChild(nameCell);

        // Round Scores
        const roundScoresCell = document.createElement("td");
        roundScoresCell.textContent = player.scores.join(", ");
        row.appendChild(roundScoresCell);

        // Total Score
        const totalScoreCell = document.createElement("td");
        totalScoreCell.textContent = player.total;
        row.appendChild(totalScoreCell);

        // Points Left
        const pointsLeftCell = document.createElement("td");
        if (scoreLimit !== null && !player.eliminated) {
            const pointsLeft = scoreLimit - player.total;
            if (pointsLeft > 0) {
                pointsLeftCell.textContent = pointsLeft;
                if (pointsLeft <= 20) {
                    pointsLeftCell.style.color = "red";
                } else {
                    pointsLeftCell.style.color = "#333";
                }
            } else {
                pointsLeftCell.textContent = "Eliminated";
                pointsLeftCell.style.color = "red";
            }
        } else if (player.eliminated) {
            pointsLeftCell.textContent = "Eliminated";
            pointsLeftCell.style.color = "red";
        } else {
            pointsLeftCell.textContent = "-";
            pointsLeftCell.style.color = "#333";
        }
        row.appendChild(pointsLeftCell);

        // Apply eliminated row styling
        if (player.eliminated) {
            row.classList.add("eliminated");
        }

        scoreTableBody.appendChild(row);
    });

    // Update the current round display
    document.getElementById("round-number").textContent = currentRound;
}

// Function to update the player dropdown for score input
function updatePlayerDropdown() {
    const playerSelect = document.getElementById("player-select");
    playerSelect.innerHTML = "";

    players.forEach((player, index) => {
        if (!player.eliminated && !scoresEnteredThisRound.has(index)) {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = player.name;
            playerSelect.appendChild(option);
        }
    });

    // If no players are available for score input, disable the score input section
    const activePlayers = players.filter(p => !p.eliminated).length;
    if (playerSelect.options.length === 0 && activePlayers > 0) {
        document.getElementById("score-value").disabled = true;
        document.getElementById("player-select").disabled = true;
        document.querySelector("#score-input button").disabled = true;
    } else {
        document.getElementById("score-value").disabled = false;
        document.getElementById("player-select").disabled = false;
        document.querySelector("#score-input button").disabled = false;
    }
}

// Function to add score for a selected player
function addScore() {
    const playerSelect = document.getElementById("player-select");
    const scoreInput = document.getElementById("score-value");
    const scoreValue = parseInt(scoreInput.value);

    // Ensure a player is selected
    if (playerSelect.value === "") {
        alert("Please select a player.");
        return;
    }

    // Ensure a valid score is entered
    if (isNaN(scoreValue) || scoreValue < 0) {
        alert("Please enter a valid score.");
        return;
    }

    const playerIndex = parseInt(playerSelect.value);
    const player = players[playerIndex];

    // Check if player is already eliminated
    if (player.eliminated) {
        alert("This player has been eliminated and cannot enter scores.");
        return;
    }

    // Check if player has already entered score for this round
    if (scoresEnteredThisRound.has(playerIndex)) {
        alert("This player has already entered score for this round.");
        return;
    }

    // If score limit is not set yet, set it and disable the select
    if (scoreLimit === null) {
        const scoreLimitSelect = document.getElementById("score-limit");
        scoreLimit = parseInt(scoreLimitSelect.value);
        scoreLimitSelect.disabled = true;
    }

    // Add score to the player's scores and update total
    player.scores.push(scoreValue);
    player.total += scoreValue;

    // Mark the player as having entered score for this round
    scoresEnteredThisRound.add(playerIndex);

    // Clear the input field
    scoreInput.value = "";

    // Update the scoreboard
    updateScoreboard();

    // Check for elimination
    checkForElimination();

    // Update the player dropdown
    updatePlayerDropdown();

    // If all active players have entered score for this round, reset for next round
    if (scoresEnteredThisRound.size === players.filter(p => !p.eliminated).length) {
        // All players have entered their score for the current round
        // Reset the scoresEnteredThisRound set and increment the round
        resetForNextRound();
    }
}

// Function to check if any player has reached the score limit
function checkForElimination() {
    players.forEach((player, index) => {
        if (!player.eliminated && player.total >= scoreLimit) {
            player.eliminated = true;
            if (!player.eliminationNotified) {
                alert(`${player.name} has been eliminated!`);
                player.eliminationNotified = true;
            }
        }
    });
}

// Function to reset for the next round
function resetForNextRound() {
    currentRound += 1;
    scoresEnteredThisRound.clear();
    updateScoreboard();
    updatePlayerDropdown();
}
