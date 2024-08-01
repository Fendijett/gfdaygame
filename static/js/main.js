const socket = io();

document.getElementById('joinForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const room = document.getElementById('room').value;
    if (username && room === "23") {
        socket.emit('join', { username: username, room: room });
        document.getElementById('joinForm').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        document.getElementById('backgroundMusic').play(); // Start background music
    } else {
        alert('Please enter a valid username and room code.');
    }
});

document.getElementById('addWord').addEventListener('click', function() {
    const wordInputs = document.getElementById('wordInputs');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'wordInput';
    newInput.placeholder = 'Enter a word';
    wordInputs.appendChild(newInput);
});

document.getElementById('submitWords').addEventListener('click', function() {
    const inputs = document.querySelectorAll('.wordInput');
    const words = [];
    inputs.forEach(input => {
        if (input.value) {
            words.push(input.value);
        }
    });
    const username = document.getElementById('username').value;
    socket.emit('submit_words', { username: username, words: words });
});

socket.on('update_room', function(data) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    data.players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = player;
        playersList.appendChild(listItem);
    });
});

socket.on('update_ready', function(data) {
    const readyList = document.getElementById('readyList');
    readyList.innerHTML = '';
    for (const player in data) {
        const listItem = document.createElement('li');
        listItem.textContent = player + ' - ' + (data[player] ? '✔️' : '❌');
        readyList.appendChild(listItem);
    }
});

socket.on('start_countdown', function() {
    document.getElementById('inputWords').style.display = 'none';
    document.getElementById('countdown').style.display = 'block';
    let countdown = 5;
    const countdownTimer = document.getElementById('countdownTimer');
    const interval = setInterval(function() {
        countdownTimer.textContent = countdown;
        countdown -= 1;
        if (countdown < 0) {
            clearInterval(interval);
            document.getElementById('countdown').style.display = 'none';
            document.getElementById('heartContainer').style.display = 'block';
            socket.emit('start_game');
        }
    }, 1000);
});

socket.on('display_hearts', function(data) {
    const heartContainer = document.getElementById('heartContainer');
    heartContainer.innerHTML = '';  // Clear previous hearts
    data.words.forEach(word => {
        const heartWrapper = document.createElement('div');
        heartWrapper.style.position = 'relative';
        
        const heart = document.createElement('div');
        heart.className = 'heart hidden';
        heart.dataset.word = word;

        const wordDiv = document.createElement('div');
        wordDiv.className = 'revealed-word';
        wordDiv.style.display = 'none';
        wordDiv.textContent = word;

        heart.addEventListener('click', function() {
            heart.style.display = 'none';
            wordDiv.style.display = 'block';
            createSplashEffect(event.pageX, event.pageY); // Add splash effect
        });

        heartWrapper.appendChild(heart);
        heartWrapper.appendChild(wordDiv);
        heartContainer.appendChild(heartWrapper);
    });

    // Floating hearts animation
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach(heart => {
        heart.style.position = 'absolute';
        heart.style.left = `${Math.random() * 80 + 10}%`;
        heart.style.bottom = `-${Math.random() * 20 + 5}vh`;
        heart.style.animation = `floatUp ${Math.random() * 20 + 10}s linear infinite`;
    });
});

window.addEventListener('beforeunload', function() {
    socket.disconnect();
});

function createSplashEffect(x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    document.body.appendChild(splash);
    setTimeout(() => {
        splash.remove();
    }, 1000);
}
