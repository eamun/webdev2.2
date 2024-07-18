//sorry about the state of some parts of the code :P

//variables
let canvas;
let context;
let xhttp;

let outcome = '';
let score = 0;
let drawno = 0;
let fpsinterval = 1000 / 30;
let now;
let then = Date.now();
let request_id;
let round = 1;
let max_enemies = round * 10;

let zombies = [];
let player = {
    x: 0,
    y: 0,
    size: 10,
    health: 100,
    xchange: 1.9,
    ychange: 1.9,
    frameX: 0,
    frameY: 0,
    height: 32,
    width: 35,
    canshoot: false
};

let gun = {
    x: 0,
    y: 0,
    width: 27,
    height: 9
}

let bullets = [];

let playernogun = new Image();
let playernogunL = new Image();
let playernogunidle = new Image();
let playerimageIdle = new Image();
let zombieimageR = new Image();
let zombieimageL = new Image();
let playerimageR = new Image();
let playerimageL = new Image();
let gunimage = new Image();

// buttons
let moveleft = false;
let moveright = false;
let moveup = false;
let movedown = false;
let space = false;


document.addEventListener('DOMContentLoaded', init, false);

//start function
function init() {
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');

    window.addEventListener('keydown', activate, false);
    window.addEventListener('keyup', deactivate, false);

    player.x = (canvas.width / 2);
    player.y = (canvas.height / 2);

    gun.x = randint(200, canvas.width - 200);
    gun.y = randint(150, canvas.height - 150);

    load_assets([
        { 'var': playerimageIdle, 'url': '../static/Player_AnimationIdle.png' },
        { 'var': playerimageR, 'url': '../static/Player_AnimationR.png' },
        { 'var': playerimageL, 'url': '../static/Player_AnimationL.png' },
        { 'var': playernogun, 'url': '../static/playernogun.png' },
        { 'var': playernogunL, 'url': '../static/playernogunL.png' },
        { 'var': playernogunidle, 'url': '../static/playernogunidle.png' },
        { 'var': zombieimageR, 'url': '../static/zombie-walk2.png' },
        { 'var': zombieimageL, 'url': '../static/zombie-walkL.png' },
        { 'var': gunimage, 'url': '../static/3_1.png' },

    ], draw);
}

function draw() {
    if (score < 0) {
        score = 0
    };
    let score_element = document.querySelector('#score');
    score_element.innerHTML = 'score: ' + score;
    let round_element = document.querySelector('#round');
    round_element.innerHTML = 'Round: ' + round;

    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsinterval) {
        return;
    };
    context.clearRect(0, 0, canvas.width, canvas.height);
    then = now - (elapsed % fpsinterval);
    drawno += 1;
    //score = Math.floor(drawno / 1000);

    //bullet collisions
    for (let b of bullets) {
        if (b.x + b.size >= canvas.width - 10 || b.x <= 10) {
            let index = bullets.indexOf(b)
            bullets.splice(index, 1)
        };
    };
    for (let b of bullets) {
        for (let z of zombies) {
            if (bullet_collides(z, b)) {
                let index = bullets.indexOf(b)
                bullets.splice(index, 1)
                index = zombies.indexOf(z)
                zombies.splice(index, 1)
                max_enemies -= 1
                score = score + round
                if (max_enemies === 0) {
                    round += 1
                    max_enemies = round * 10
                };
            };
        };
    };
    //drawing gun (and bullets)
    if (player_collides_gun(gun) && score < 10) {
        score += 10
    }
    else if (player.canshoot === false) {
        context.drawImage(gunimage,
            0, 0, gun.width, gun.height,
            gun.x, gun.y, gun.width, gun.height);
    };
    for (let b of bullets) {
        context.fillStyle = 'beige'
        context.fillRect(b.x, b.y, b.size, b.size);
    }
    for (let b of bullets) {
        b.x = b.x + b.xchange;
        b.y = b.y + b.ychange;
    }
    //drawing player
    if (player.canshoot === false) {
        if (!movedown && !moveup && !moveleft && !moveright) {

            context.drawImage(playernogunidle,
                player.width * player.frameX, player.height * player.frameY, player.width, player.height,
                player.x, player.y, player.width, player.height);
            if (drawno % 3 === 0) {
                player.frameX = (player.frameX + 1) % 5
            }
        }
        if (moveright || movedown && !(moveleft && movedown)) {
            context.drawImage(playernogun,
                player.width * player.frameX, player.height * player.frameY, player.width, player.height,
                player.x, player.y, player.width, player.height);
            if (drawno % 3 === 0) {
                player.frameX = (player.frameX + 1) % 6
            }
        }
        else if (moveleft || moveup) {
            context.drawImage(playernogunL,
                player.width * player.frameX, player.height * player.frameY, player.width, player.height,
                player.x, player.y, player.width, player.height);
            if (drawno % 3 === 0) {
                player.frameX = (player.frameX + 1) % 6
            }
        }
    }
    if (player.canshoot) {
        if (!movedown && !moveup && !moveleft && !moveright) {
            context.drawImage(playerimageIdle,
                player.width * player.frameX, player.height * player.frameY, player.width, player.height,
                player.x, player.y, player.width, player.height);
            if (drawno % 3 === 0) {
                player.frameX = (player.frameX + 1) % 5
            }
        }
        if (moveright || movedown && !(moveleft && movedown)) {
            context.drawImage(playerimageR,
                player.width * player.frameX, player.height * player.frameY, player.width, player.height,
                player.x, player.y, player.width, player.height);
            if (drawno % 3 === 0) {
                player.frameX = (player.frameX + 1) % 6
            }
        }
        else if (moveleft || moveup) {
            context.drawImage(playerimageL,
                player.width * player.frameX, player.height * player.frameY, player.width, player.height,
                player.x, player.y, player.width, player.height);
            if (drawno % 3 === 0) {
                player.frameX = (player.frameX + 1) % 6
            }
        }
    }
    //drawing zombies
    if (zombies.length < max_enemies) {
        let z = {
            x: (15),
            y: ((canvas.height / 2) - 20),
            size: randint(20, 30),
            width: 48,
            height: 34,
            xchange: randint(0, 3),
            ychange: randint(-10, 10),
            frameX: randint(1, 4),
            frameY: 0
        };
        zombies.push(z);
    }
    if (zombies.length < max_enemies) {
        let z = {
            x: (canvas.width - 60),
            y: ((canvas.height / 2) - 20),
            size: randint(20, 30),
            width: 48,
            height: 34,
            xchange: randint(0, -3),
            ychange: randint(-10, 10),
            frameX: randint(1, 4),
            frameY: 0
        };
        zombies.push(z);
    }
    for (let z of zombies) {
        //console.log('bruh')
        if (z.xchange > 0 || z.xchange === 0) {
            context.drawImage(zombieimageR,
                z.width * z.frameX, z.height * z.frameY, z.width, z.height,
                z.x, z.y, z.width, z.height);
            if (drawno % 4 === 0) {
                z.frameX = (z.frameX + 1) % 4
            }
        }
        if (z.xchange < 0) {
            context.drawImage(zombieimageL,
                z.width * z.frameX, z.height * z.frameY, z.width, z.height,
                z.x, z.y, z.width, z.height);
            if (drawno % 4 === 0) {
                z.frameX = (z.frameX + 1) % 4
            }
        }
    }

    //regen
    if (drawno % 25 === 0 && player.health <= 99) {
        player.health += 1
    }
    //collision with border
    for (let z of zombies) {
        if (z.x < 10 || z.x + z.width > (canvas.width - 9)) {
            z.xchange = -z.xchange * 0.9;
        }
        else if (z.y + z.height > (canvas.height - 10) || z.y + z.height < 42) {
            z.ychange = -z.ychange * 0.9;
        }
    }
    if (player.x <= 10) {
        player.x = 11
    }
    else if (player.x + player.width >= canvas.width - 10) {
        player.x = (canvas.width - 11) - player.width
    }
    if (player.y <= 42 - player.height) {
        player.y = 42 - player.height
    }
    else if (player.y + player.height >= canvas.height - 10) {
        player.y = (canvas.height - 11) - player.height
    }

    //homing
    for (let z of zombies) {
        let leftover = 35 - z.size
        if (player.y > z.y) {
            z.ychange += leftover * 0.005
        }
    }
    for (let z of zombies) {
        let leftover = 35 - z.size
        if (player.x > z.x) {
            z.xchange += leftover * 0.005
        }
    }
    for (let z of zombies) {
        let leftover = 35 - z.size
        if (player.x < z.x) {
            z.xchange -= leftover * 0.005
        }
    }
    for (let z of zombies) {
        let leftover = 35 - z.size
        if (player.y < z.y) {
            z.ychange -= leftover * 0.005
        }
    }
    //slowing
    for (let z of zombies) {
        if (z.ychange > (round + 4) / 3 || z.ychange < -(round + 4) / 3) {
            z.ychange = z.ychange * 0.8
        }
        if (z.xchange > (round + 4) / 3 || z.xchange < -(round + 4) / 3) {
            z.xchange = z.xchange * 0.8
        }
    }
    //collision w zombie
    for (let z of zombies) {
        if (player.health <= 0) {
            outcome = 'Game Over'
            score -= 1
            score_element.innerHTML = 'score ' + score
            stop(outcome);
            return
        }
        else if (player_collides(z)) {
            player.health = player.health - (z.size / 8);
            score -= 1
        }
        //if (z.x - z.size <=player.x+player  || z.x + z.size >= player.x) {
        //    z.xchange = -z.xchange * 0.9;
        //}
        //else if (z.y + z.size >= player.y+player.size || z.y - z.size <= player.y) {
        //    z.ychange = -z.ychange * 0.9;
        //}
    }
    //health bar
    context.fillStyle = 'pink';
    context.fillRect(10, 14, (player.health) * 0.74, 10);
    //win condition
    if (round === 6) {
        context.clearRect(6, 210, 60, 257)
        context.clearRect(695, 210, 754, 257)
        score = score + 20
        score_element.innerHTML = 'score ' + score
        outcome = 'You Win'
        stop(outcome)
        return
    }
    //player and zombie movement

    for (let z of zombies) {
        z.x = z.x + z.xchange;
        z.y = z.y + z.ychange;
    }
    if (moveleft) {
        player.x = player.x - player.xchange;
    }
    if (moveright) {
        player.x = player.x + player.xchange;
    }
    if (moveup) {
        player.y = player.y - player.ychange;
    }
    if (movedown) {
        player.y = player.y + player.ychange;
    }
    //bullets
    if (player.canshoot === true && space === true && drawno % 2 === 0) {
        let b = {
            x: player.x + 20,
            y: player.y + 23,
            size: 2,
            xchange: 0,
            ychange: (randint(-200, 200) / 1000),
        };
        if ((moveright || movedown) && !(moveleft || moveup)) {
            b.xchange = (randint(100, 120) / 10)
        }
        else if ((moveleft || moveup) && !(moveright || movedown)) {
            b.xchange = (randint(-100, -120) / 10)
        }
        else if (moveright && moveup) {
            b.xchange = (randint(100, 120) / 10)
        }
        else if (moveleft && movedown) {
            b.xchange = (randint(-100, -120) / 10)
        }
        else {
            b.xchange = (randint(100, 120) / 10)
        }
        bullets.push(b);
    }
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function activate(event) {
    let key = event.key;
    if (key === ' ') {
        space = true;
    }
    if (key === 'ArrowLeft') {
        moveleft = true;

    }
    else if (key === 'ArrowRight') {
        moveright = true;

    }
    else if (key === 'ArrowUp') {
        moveup = true;

    }
    else if (key === 'ArrowDown') {
        movedown = true;

    }
}

function deactivate(event) {
    let key = event.key;
    if (key === ' ') {
        space = false;
    }
    if (key === 'ArrowLeft') {
        moveleft = false;
    }
    else if (key === 'ArrowRight') {
        moveright = false;
    }
    else if (key === 'ArrowUp') {
        moveup = false;
    }
    else if (key === 'ArrowDown') {
        movedown = false;
    }
}

function player_collides(z) {
    if (player.x + player.width < (z.x + 10) || z.x + (z.width - 10) < player.x || player.y > z.y + (z.height - 5) || (z.y + 10) > player.y + player.height) {
        return false;
    }
    else {
        return true;
    }
}
function player_collides_gun(gun) {
    if (player.x + (player.width - 5) < gun.x || gun.x + gun.width < (player.x + 5) || (player.y + 5) > gun.y + gun.height || gun.y > player.y + (player.height - 5)) {
        return false;
    }
    else {
        player.canshoot = true;
        return true;
    }
}
function bullet_collides(z, b) {
    if (z.x + z.width < b.x || b.x + b.size < z.x || z.y > b.y + b.size || b.y > z.y + z.height) {
        return false;
    }
    else {
        return true
    }
}

function load_assets(assets, callback) {
    let num_assets = assets.length
    let loaded = function () {
        console.log('loaded');
        num_assets = num_assets - 1;
        if (num_assets === 0) {
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if (element instanceof HTMLImageElement) {
            console.log('img')
            element.addEventListener('load', loaded, false);
        }
        else if (element instanceof HTMLAudioElement) {
            console.log('audio')
            element.addEventListener('canplaythrough', loaded, false)
        }
        element.src = asset.url
    }
}

function stop(outcome) {
    window.removeEventListener('keydown', activate, false);
    window.removeEventListener('keyup', activate, false);
    window.cancelAnimationFrame(request_id);
    let outcome_element = document.querySelector('#outcome');
    outcome_element.innerHTML = outcome

    let data = new FormData();
    data.append('score', score)

    xhttp = new XMLHttpRequest();
    xhttp.addEventListener('readystatechange', handle_response, false)
    xhttp.open('POST', '../run.py/store_score', true)
    xhttp.send(data)
}
function handle_response() {
    if (xhttp.readyState === 4) {
        if (xhttp.status === 200) {
            if (xhttp.responseText === 'success') {
                console.log('Stored')
            }
            else {
                console.log('nah')
            }
        }
    }
}