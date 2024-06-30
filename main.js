document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // Example: Add event listener to start button
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        // Your start game logic here
    });

    // Example: Add event listener to difficulty slider
    const difficultySlider = document.getElementById('difficulty');
    difficultySlider.addEventListener('input', (event) => {
        console.log('Difficulty level:', event.target.value);
        // Adjust game difficulty here
    });
});