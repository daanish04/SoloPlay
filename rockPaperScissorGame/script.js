let pscore=document.querySelector('.pscore');
let cscore=document.querySelector('.cscore');
let pimg=document.querySelector('.player');
let cimg=document.querySelector('.comp');
let resultDisplay=document.querySelector('.resultDisplay')
let hand=["rock", "paper", "scissors"];

let pmove;
let cmove;
ps=0;
cs=0;

function play(playerMove){
    cimg.classList.remove('rock', 'paper', 'scissors');
    pimg.classList.remove('rock', 'paper', 'scissors');
    cmove=hand[Math.floor(Math.random()*3)];
    pmove=playerMove;
    console.log(cmove);

    cimg.classList.add(cmove);
    pimg.classList.add(pmove);

    let result;
    if(pmove==cmove){
        result="IT'S A TIE!";
    }
    else{
        switch(pmove){
            case "rock":
                result= cmove=='scissors'? "YOU WIN!" : "YOU LOSE!"
                break;
            case "paper":
                result= cmove=='rock'? "YOU WIN!" : "YOU LOSE!"
                break;
            case "scissors":
                result= cmove=='paper'? "YOU WIN!" : "YOU LOSE!"
                break;
        }
    }

    resultDisplay.textContent=result;

    if(result=='YOU WIN!'){
        ps++;
        pscore.textContent=ps;
    }
    if(result=='YOU LOSE!'){
        cs++;
        cscore.textContent=cs;
    }
}

function reset(){
    ps=0;
    cs=0;
    pscore.textContent=ps;
    cscore.textContent=cs;
    resultDisplay.textContent="";
    cimg.classList.remove('rock', 'paper', 'scissors');
    pimg.classList.remove('rock', 'paper', 'scissors');
}