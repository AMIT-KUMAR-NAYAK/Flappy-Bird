//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context; // stores canvas

//bird
let birdWidth = 40; // W/H = 408/228 = 17/12
let birdHeight = 40;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

// pipes
let pipeArray = [];
let pipeWidth = 64; // W/H ratio = 384/3072 = 1/8 
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipes moving left
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

let wingSound = new Audio("./Sounds/ghoul/flap.mp3");
let hitSound = new Audio("./Sounds/ghoul/hit.mp3");
let pointSound = new Audio("./Sounds/ghoul/point.mp3");
let dieSound = new Audio("./Sounds/ghoul/die.mp3");
let bgmSound = new Audio("./Sounds/ghoul/bgm.mp3");
bgmSound.loop = true;


let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
};

window.onload = () => {
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d'); // drawing on canvas
 
    // draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    // load Images
    birdImg = new Image();
    birdImg.src = "./Images/ghost/flappy_ghost.png";
    birdImg.onload = ()=>{
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    
    topPipeImg = new Image();
    topPipeImg.src = "./Images/pipes/toppipe.png"

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./Images/pipes/bottompipe.png"

    requestAnimationFrame(update);

    setInterval(placePipe, 1500); // every 1.5s new pipe

    document.addEventListener("keydown", handleInput, { passive: false });
    document.addEventListener("pointerdown", handleInput);
    document.addEventListener("touchstart", handleInput, { passive: false });
}

function update()
{
    requestAnimationFrame(update);
    if(gameOver)
        return;
    context.clearRect(0, 0, board.width, board.height);

    // bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); // bird stays within canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    
    if(bird.y > board.height)
    {
        gameOver = true;  
        dieSound.play();
    }
    
    // pipes
    for( let i = 0; i < pipeArray.length; i++)
    {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if(!pipe.passed && bird.x > pipe.x + pipe.width)
        {
            pointSound.play();
            score += 0.5;
            pipe.passed = true;
        }

        if(detectCollision(bird, pipe)){
            gameOver = true;
            hitSound.play();
        }

    }

    // clear pipes
    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth)
    {
        pipeArray.shift(); // removes pipes off the canvas
    }
    // score
    context.fillStyle = "white";
    context.font = "45px 'Pixelify Sans', sans-serif";
    context.fillText(score, 20, 45);
    
    if(gameOver)
    {
        context.textAlign = "center";
        context.textBaseline = "middle"; 
        context.fillText("GAME OVER", boardWidth/2, boardHeight/2);
        bgmSound.pause();
        bgmSound.currentTime = 0;
    }
}

function placePipe(){
    if(gameOver)
        return;   
    // (0 - 1) * pipeHeight/2
    // 0 -> 128 (pipeHeight/4)
    // 1 -> 128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random() * (pipeHeight/2);
    let openingspace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingspace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };
    pipeArray.push(bottomPipe);
}

function handleInput(e) 
{
    // Allow audio to start on first user gesture
    if (bgmSound.paused) bgmSound.play();

    // If game over, a press/click/touch restarts instead of flaps
    if (gameOver) 
    {
        restartGame();
        return;
    }

    // Normalize which inputs should flap
    const isKey = e.type === "keydown";
    const isSpace = isKey && (e.code === "Space" || e.key === " " || e.key === "Spacebar");
    const isArrowUp = isKey && (e.code === "ArrowUp" || e.key === "ArrowUp");
    const isEnter = isKey && (e.code === "Enter" || e.key === "Enter");
    const isLeftClick = e.type === "pointerdown" && e.button === 0;      // mouse
    const isTouch = e.type === "touchstart" || (e.type === "pointerdown" && e.pointerType === "touch");

    // Prevent browser from scrolling on Space/ArrowUp on some pages
    if (isKey && (isSpace || isArrowUp)) e.preventDefault();

    // Avoid auto-repeat when holding the key down
    if (isKey && e.repeat) return;

    if (isSpace || isArrowUp || isEnter || isLeftClick || isTouch)
    {
        {
            velocityY = -6;
            try { wingSound.currentTime = 0; wingSound.play(); } catch {}
        }
    }
}

// Simple restart helper
function restartGame() {
    bird.y = birdY;
    bird.x = birdX;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    bgmSound.currentTime = 0;
    bgmSound.play();
}

function detectCollision(a, b){
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}