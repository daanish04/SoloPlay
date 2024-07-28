function playSound(key) {
    const audio = new Audio(`piano-mp3/${key}.mp3`);
    audio.play();
}

const keyMap = {
    'a': 'C4', 'w': 'Db4', 's': 'D4', 'e': 'Eb4', 'd': 'E4',
    'f': 'F4', 't': 'Gb4', 'g': 'G4', 'y': 'Ab4', 'h': 'A4',
    'u': 'Bb4', 'j': 'B4', 'k': 'C5', 'o': 'Db5', 'l': 'D5',
    'p': 'Eb5', ';': 'E5'
};

document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    if (keyMap[key]) {
        playSound(keyMap[key]);
        highlightKey(keyMap[key]);
    }
});

function highlightKey(note) {
    const keyElement = document.getElementById(note);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 200);
    }
}
