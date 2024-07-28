let board=document.querySelector('.scoreboard');
let start=document.querySelector('.startBtn');
let holes=document.querySelectorAll('.hole');
let moles=document.querySelectorAll('.mole');
let countdown=document.querySelector('.timer');
let score=0;
let timeUp=false;
let lastHole;
board.value=0;

function updateCountdown(){
    let t=countdown.innerHTML;
    t--;
    countdown.innerHTML= t>=10? t : "0" + t;
}

function getRndTime(min,max){
    return Math.floor(Math.random()+(max-min) + min);
}

function randomHole(holes){
    let idx=Math.floor(Math.random() * holes.length);
    let hole=holes[idx];

    if(hole==lastHole){
        return randomHole(holes);
    }

    lastHole=hole;
    return hole;
}

function peep(){
    let time=getRndTime(500,1200);
    let hole=randomHole(holes);
    hole.classList.add('up');
    setTimeout(() => {
        hole.classList.remove('up');
        if(!timeUp){
            peep();
        }
    }, time);
    
}

function whack(){
    score++;
    this.parentNode.classList.remove('up');
    board.value=score;
}

start.addEventListener('click', function(){
    timeUp=false;
    start.disabled=true;
    board.classList.remove("bold");
    start.style.cursor="not-allowed";
    countdown.innerHTML=30;
    let interval=setInterval(updateCountdown,1000);
    board.value=0;
    score=0;
    peep();
    setTimeout(() => {
       timeUp=true;
       clearInterval(interval);
       start.disabled=false;
       start.style.cursor="pointer";
       board.classList.add('bold');
    }, 30000);
})

moles.forEach(function(mole){
    mole.addEventListener('click', whack);
});