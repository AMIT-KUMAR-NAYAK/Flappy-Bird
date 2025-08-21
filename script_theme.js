let theme_1 = document.getElementById("flappy")
theme_1.addEventListener('mousedown', ()=>{
    window.location.href = "game_morning.html";
    // startGame("flappy");
})

let theme_2 = document.getElementById("ghoul")
theme_2.addEventListener('mousedown', ()=>{
    window.location.href = "game_night.html";
    // startGame("ghoul");
});

// useful if written in single js file
// function startGame(theme) {
//     if (theme === "flappy") {
//         game_morning();
//     } else if (theme === "ghoul") {
//         game_night();
//     }
// }
