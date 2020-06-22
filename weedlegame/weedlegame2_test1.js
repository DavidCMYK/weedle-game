var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    parent: 'game_div',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var player;
var pidgeys;
var magikarps;
var geodudes;

//image and terrain groups
var skies;
var platforms;
var backGrasses;
var frontGrasses;
var Leaves;
var branches;
var trunks;
var berries;

//game object groups
var pokeballs;
var bombs;

//game mechanics
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var moveRight, moveLeft, moveUp, moveDown;
var gameCanvas;
var mainCamera;

var worldWidth = 10000;
var minBiomeLength = 400;
var worldHeight = 600;
var worldLayers = 9;
var layerHeight = Math.floor(worldHeight/worldLayers)-1;

var testvar;
var platformCollider;
var initialSpawnCheck;
var errText;
var yVel;

var Biome;
var treeHeight, lowestBranch, branchLength, treeDensity, ledgeHigh, ledgeLow, ledgeLength, ledgeDensity, solidGround;
var biomeSky;

function preload ()
{
    this.load.image('skygrassland', 'weedlegame/assets/skygrassland.png');
    this.load.image('skyislands', 'weedlegame/assets/skyislands.png');
    this.load.image('skyforest', 'weedlegame/assets/skyforest.png');
    this.load.image('skyhills', 'weedlegame/assets/skyhills.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('ledge', 'weedlegame/assets/ledge.png');
    this.load.image('grass1', 'weedlegame/assets/grass1.png');
    this.load.image('grass2', 'weedlegame/assets/grass2.png');
    this.load.image('grass3', 'weedlegame/assets/grass3.png');
    this.load.image('grassfront1', 'weedlegame/assets/grassfront1.png');
    this.load.image('grassfront2', 'weedlegame/assets/grassfront2.png');
    this.load.image('grassfront3', 'weedlegame/assets/grassfront3.png');
    this.load.image('leaves1', 'weedlegame/assets/leaves1.png');
    this.load.image('leaves2', 'weedlegame/assets/leaves2.png');
    this.load.image('leaves3', 'weedlegame/assets/leaves3.png');

    this.load.image('razz', 'weedlegame/assets/razz.png');

    this.load.image('trunk1', 'weedlegame/assets/treetrunk1.png');
    this.load.image('trunk2', 'weedlegame/assets/treetrunk2.png');
    this.load.image('trunk3', 'weedlegame/assets/treetrunk3.png');

    this.load.image('platform', 'weedlegame/assets/branch1.png');
    this.load.image('soil', 'weedlegame/assets/soil.png');
    this.load.spritesheet('water', 'weedlegame/assets/water.png', { frameWidth: 40, frameHeight: 20 });

    this.load.image('pokeball', 'weedlegame/assets/pokeball.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('weedle', 'weedlegame/assets/weedle.png', { frameWidth: 64, frameHeight: 32 });
    this.load.spritesheet('weedleair', 'weedlegame/assets/weedleair.png', { frameWidth: 32, frameHeight: 67 });
    this.load.spritesheet('weedletall', 'weedlegame/assets/weedletall.png', { frameWidth: 32, frameHeight: 49 });

    this.load.spritesheet('pidgey', 'weedlegame/assets/pidgey.png', { frameWidth:73, frameHeight: 55 });
    this.load.spritesheet('magikarp', 'weedlegame/assets/magikarp.png', { frameWidth:93, frameHeight: 77 });
    this.load.spritesheet('geodude', 'weedlegame/assets/geodude.png', { frameWidth:85, frameHeight: 32 });

    this.load.image('gameover', 'weedlegame/assets/gameover.png');

}

function create ()
{
    //Add cameras
    mainCamera = this.cameras.main;
    mainCamera.setSize(800, 400);
    mainCamera.setBounds(0, 0, worldWidth, 600);
    mainCamera.roundPixels = true;

    //event listeners for touch controls
    gameCanvas = document.getElementsByTagName("canvas")[0];
    gameCanvas.addEventListener("touchstart", handleTouch, false);
    gameCanvas.addEventListener("touchmove", handleTouch, false);
    gameCanvas.addEventListener("touchend", handleEnd, false);
    gameCanvas.addEventListener("touchcancel", handleEnd, false);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    backGrasses = this.add.group();
    frontGrasses = this.add.group();
    soils = this.add.group();
    waters = this.physics.add.staticGroup();
    
    skies = this.add.group();

    branches = this.physics.add.staticGroup();
    Leaves = this.physics.add.staticGroup();
    trunks = this.physics.add.staticGroup();

    pokeballs = this.physics.add.group();
    berries = this.physics.add.staticGroup();

    pidgeys = this.physics.add.group();
    magikarps = this.physics.add.group();
    geodudes = this.physics.add.group();


    var biomeStart = 0;
    var xLedge = 0;
    var yLedge = 200;
    var prevX = 0;
    var prev1Y = 0;
    var prev2Y = 0;

    //create a starting ledge
    createLedge(15,7*layerHeight,20);
    // place weedle on the first ledge
    player = this.physics.add.sprite(20, 7*layerHeight-40, 'weedle');

    //Define sections of the world as unique biomes
    while (biomeStart < worldWidth)
    {
        biomeLength = minBiomeLength + Math.round(Math.random() * worldWidth / 4);
        Biome = getBiome();

        //  Create ledges which can be climbed

        //create one ledge which runs across the bottom of the screen, except in Islands biomes
        if (solidGround)
        {
            createLedge(biomeStart, 9*layerHeight, biomeLength/30);
        }
        else
        {
            //create water where there's no land
            for (i=0; i<biomeLength/30; i++)
            {
                waterX = biomeStart + i*30;
                waters.create(waterX, worldHeight-10, 'water');
                //randomly spawn magikarp
                if (i>3 && Math.random() < 0.1)
                {
                    magikarps.create(waterX, 300+Math.random()*240, 'magikarp');
                }
            }
        }
       

        //set the positions for the ledges and load the background images
        for (ledgeNo=0; ledgeNo<ledgeDensity*biomeLength/400; ledgeNo++)
        {
            //set the starting point of the next ledge
            xLedge = biomeStart + Math.random() * biomeLength;
            yLedge = Math.round(ledgeHigh + (Math.random() * (ledgeLow - ledgeHigh))) * (layerHeight); //the bottom ledge should be slightly above ground/water

            thisLedgeLength = Math.random() * ledgeLength * 2; //number of segments in the current platform
            
            //Create a ledge
            createLedge(xLedge, yLedge, thisLedgeLength);

            if (Biome=='Hills' && Math.random() < 0.1)
            {
                //createGeodude(xLedge, yLedge - 30);
            }
        }

        //  Now let's create some trees
        for (treeNo=0; treeNo<treeDensity * biomeLength / 400; treeNo++)
        {
            //set the position of the tree trunk
            xTree = biomeStart + Math.random() * biomeLength;

            //set the tree height
            thisTreeHeight = treeHeight + Math.round((lowestBranch-treeHeight) * Math.random())
            yTree = thisTreeHeight * layerHeight;

            //create the trunk
            trunks.create(xTree, yTree+416, 'trunk' + Math.round((Math.random()*2) +1));

            //at each level of the tree, create a branch
            for(i=thisTreeHeight; i<=lowestBranch; i++)
            {
                //set the length of the branch
                if (i==treeHeight)
                {
                    thisBranchLength = Math.round(Math.random() * branchLength) +1;
                } else {
                    thisBranchLength = Math.round(Math.random() * branchLength);
                }
               
                //set starting point of branch
                xBranch = xTree - thisBranchLength * 30 / 2;
                yBranch = (i) * layerHeight;

                //create branch segments
                for (j=0; j<=thisBranchLength; j++)
                {
                    yBranch += (Math.random()*8-4)
                    branches.create(xBranch, yBranch, 'platform');
                    
                    //add leaves
                    Leaves.create(xBranch, yBranch, 'leaves' + Math.round((Math.random()*2) +1));

                    //Add berries
                    if (Math.random() < 0.03)
                    {
                        berries.create(xBranch, yBranch +20, 'razz');
                    }

                    xBranch+=30;
                }
            }
        }

        //  Add the sky to the background
        for (i=0; i<biomeLength/400; i++)
        {
            skies.create(biomeStart + 400 * i, 300, biomeSky);

            //add pidgeys in the clear skies
            if (Biome!='Forest' && Math.random()<0.2)
            {
                createPidgey(biomeStart + 100 + 400 * i,Math.random()*300);
            }
        }

        biomeStart = biomeStart + biomeLength;
    }

    //The score
    scoreText = this.add.text(16, 16, '0', { fontSize: '32px', fill: '#FFF' });

    //Set the depth for each set of objects
    startDepth = 0;
    skies.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    trunks.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    soils.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    platforms.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    backGrasses.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });

    //insert the player into this layer
    try {
        player.depth = startDepth;
        startDepth++;
    }catch{}

    //enemies here
    pidgeys.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    geodudes.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });


    //Collectables here
    pokeballs.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });

 
    branches.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    frontGrasses.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    waters.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    berries.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    Leaves.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });
    magikarps.children.iterate(function (child) {
        child.depth = startDepth;
        startDepth++;
    });


    //text objects on top
    scoreText.depth = startDepth;
    startDepth++;



    mainCamera.startFollow(player);


    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'leftdown',
        frames: this.anims.generateFrameNumbers('weedle', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'leftup',
        frames: this.anims.generateFrameNumbers('weedle', { start: 9, end: 12 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'leftair',
        frames: this.anims.generateFrameNumbers('weedleair', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });


    this.anims.create({
        key: 'standdown',
        frames: [ { key: 'weedletall', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'standup',
        frames: [ { key: 'weedletall', frame: 1 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'standair',
        frames: this.anims.generateFrameNumbers('weedleair', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightdown',
        frames: this.anims.generateFrameNumbers('weedle', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightup',
        frames: this.anims.generateFrameNumbers('weedle', { start: 14, end: 17 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightair',
        frames: this.anims.generateFrameNumbers('weedleair', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    //pidgey animation
    this.anims.create({
        key: 'pidgeyleft',
        frames: [ { key: 'pidgey', frame: 0 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'pidgeyright',
        frames: [ { key: 'pidgey', frame: 1 } ],
        frameRate: 20
    });
    //geodude animation
    this.anims.create({
        key: 'geodudeleft',
        frames: [ { key: 'geodude', frame: 0 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'geoduderight',
        frames: [ { key: 'geodude', frame: 1 } ],
        frameRate: 20
    });

    //water animation
    this.anims.create({
        key: 'watermove',
        frames: this.anims.generateFrameNumbers('water', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    
    bombs = this.physics.add.group();

    //error output
    errText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the ledges and branches
    platformCollider = this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, branches, passPlatform, null, this);


    //Collide Pidgeys with ledges and branches
    this.physics.add.collider(pidgeys, platforms);
    this.physics.add.collider(pidgeys, branches);

    //destroy any pidgeys that spawn inside a branch
    initialSpawnCheck = this.physics.add.overlap(pidgeys, branches, destroyFirst, null, this);

    //Enemies that hit Weedle cause death
    this.physics.add.collider(player, pidgeys, suddenDeath, null, this);
    this.physics.add.collider(player, magikarps, suddenDeath, null, this);
    this.physics.add.collider(player, geodudes, suddenDeath, null, this);
   

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(pokeballs, platforms);
    this.physics.add.collider(pokeballs, branches);
    this.physics.add.collider(pokeballs, waters, replacePokeball, null, this);


    //  Checks to see if the player overlaps with any of the collectables, if he does call the collectStar function
    this.physics.add.overlap(player, pokeballs, collectPokeball, null, this);
    this.physics.add.overlap(player, berries, collectPokeball, null, this);
    
    
    this.physics.add.overlap(player, waters, suddenDeath, null, this);

    //this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{

    if (gameOver)
    {
        return;
    }

    var correctAnim;
    var moved;

    if (player.body.y > 640)
    {
        suddenDeath(player, player);
    }


    if ((cursors.left.isDown || moveLeft) && player.body.x > 0)
    {
        player.setVelocityX(-160);

        correctAnim = 'left';
        moved = true;
    }
    else if ((cursors.right.isDown || moveRight) && player.body.x < worldWidth)
    {
        player.setVelocityX(160);

        correctAnim = 'right';
        moved = true;
    }
    else
    {
        player.setVelocityX(0);
        if (moved)
        {
            moved = false;
        }

        correctAnim = 'stand';
    }

    if (player.body.touching.up)
    {
        correctAnim += 'up';
    }
    else if (player.body.touching.down)
    {
        correctAnim += 'down';
    }
    else{
        if (player.body.touching.right || player.body.touching.left)
        {
            correctAnim += 'down';
        }
        else{
            correctAnim += 'air';
        }
    }

    player.anims.play(correctAnim, true);

    waters.children.iterate(function (child) {
        child.anims.play('watermove',true);
    });

    //animate pidgeys
    pidgeys.children.iterate(function (child) {
        if (child.body.velocity.x > 0)
        {
            child.anims.play('pidgeyright',true);
        } else {
            child.anims.play('pidgeyleft',true);
        }

        //check if pidgeys are within range of weedle
        if (Phaser.Math.Distance.Between(player.body.x, player.body.y, child.body.x, child.body.y) < 300)
        {
            child.body.setVelocityY((player.body.y - child.body.y) * 2);
        }

        //check if pidgeys are above world
        if (child.body.y < 40 && child.body.velocity.y < 0)
        {
            child.body.setVelocityY(0);
        }

        //bounce pidgeys off world end
        if (child.body.x < 40 || child.body.y > worldWidth)
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }

    });

    //animate geodude
    geodudes.children.iterate(function (child) {
        if (child.body.velocity.x > 0)
        {
            child.anims.play('geoduderight',true);
        } else {
            child.anims.play('geodudeleft',true);
        }

        separation = player.body.x - child.body.x;
        //randomly change direction
        if ((separation > 0 && separation < 300 && child.body.velocity.x < 0) || (separation < 0 && separation > -300 && child.body.velocity.x > 0))
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }
        else if (Math.random()<0.03)
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }

        //bounce geodude off world end
        if ((child.body.x < 40 && child.body.velocity.x < 0) || (child.body.y > worldWidth && child.body.velocity.x > 0))
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }

    });

    //Move magikarp
    magikarps.children.iterate(function (child) {
        if (child.body.y>600)
        {
            child.body.setAccelerationY(-560);
        }
        else
        {
            child.body.setAccelerationY(0);
        }
    });

    if ((cursors.up.isDown || moveUp) && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }

    //drop from the bottom of branches
    if ((cursors.down.isDown || moveDown) && player.body.touching.up)
    {
        player.setVelocityY(10);
    }

    //drop down through ledges
    if ((cursors.down.isDown || moveDown) && player.body.y < (worldLayers-1)*layerHeight)
    {
        player.body.checkCollision.down = false;
    } else {
        player.body.checkCollision.down = true;
    }

    //pass through ledges horizontally while jumping or dropping
    if ((cursors.up.isDown || cursors.down.isDown) || (moveUp || moveDown))
    {
        platforms.children.iterate(function (child) {
            if (child.body.y < (worldHeight - layerHeight))
            {
                child.body.checkCollision.right = false;
                child.body.checkCollision.left = false;
            }
        });
    }
    else if (player.body.touching.down || player.body.touching.up)
    {
        platforms.children.iterate(function (child) {
            child.body.checkCollision.right = true;
            child.body.checkCollision.left = true;
        });
    }

    //move the score counter
    scoreText.x = player.x ;
    scoreText.y = player.y -60;

    try
    {
        initialSpawnCheck.destroy();
    }
    catch
    {
    }
}

function createGeodude(x, y, leftLimit, rightLimit)
{
    newGeodude = geodudes.create(+x, y, 'geodude');
    newGeodude.body.setAllowGravity(false);
    newGeodude.setBounce(0);
    newGeodude.body.setVelocityX(50 + Math.random() *50);
    if (Math.random > 0.5)
    {
        newGeodude.body.setVelocityX(newGeodude.body.velocity.x * -1);
    }
    newGeodude.body.setVelocityY(0);
}


function createPidgey(x, y)
{
    newPidgey = pidgeys.create(x, y, 'pidgey');
    newPidgey.body.setAllowGravity(false);
    newPidgey.setBounce(1);
    newPidgey.body.setVelocityX(100 + Math.random() *100);
    if (Math.random > 0.5)
    {
        newPidgey.body.setVelocityX(newPidgey.body.velocity.x * -1);
    }
    newPidgey.body.setVelocityY(0);
}

function collectPokeball (player, pokeball)
{
    pokeball.disableBody(true, true);

    //  Add and update the score
    updateScore(10);
}

function createLedge(x, y, length){
    for (i=0; i<length; i++)
    {
        currX = x + i * 30;
        //add ledge
        newLedge = platforms.create(currX, y, 'ledge');
        newLedge.body.checkCollision.down = false;

        //add grass
        backGrasses.create(currX, y-40, 'grass' + Math.round((Math.random()*2) +1));
        frontGrasses.create(currX, y-20, 'grassfront' + Math.round((Math.random()*2) +1));

        //add soil background
        soils.create(currX, y+300, 'soil');

        //random chance to add pokeball
        if (Math.random() < 0.03)
        {
            pokeballs.create(currX, y - 40, 'pokeball');
        }

    }
}

function replacePokeball (pokeball, water)
{
    pokeball.destroy();

}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function suddenDeath (player, enemy)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;

    var gameOverScreen = this.add.image(mainCamera.scrollX + 400, mainCamera.scrollY+200, 'gameover');
    gameOverScreen.depth = 100000;
    if ((document.getElementById('name_field').value != '') && (document.getElementById('email_field').value != ''))
    {
        document.getElementById('go_button').click();
    }

}

function destroyFirst(toDestroy, Other) {
    toDestroy.destroy();
}

function handleTouch(event){
    //establish mobile controls
    var touchRadius = layerHeight;
    var elem = document.querySelector('canvas');
    var offsetY = getElemDistance( elem );

    event.preventDefault();

    var touchX = event.changedTouches[0].pageX - gameCanvas.offsetLeft + mainCamera.scrollX;
    var touchY = event.changedTouches[0].pageY - offsetY - 50 + mainCamera.scrollY;

    
    if (touchX > player.body.x + touchRadius)
    {
        moveRight = true;
    } else {
        moveRight = false;
    }

    if (touchX < player.body.x - touchRadius)
    {
        moveLeft = true;
    } else {
        moveLeft = false;
    }

    if (touchY > player.body.y + touchRadius)
    {
        moveDown = true;
    } else {
        moveDown = false;
    }

    if (touchY < player.body.y - touchRadius)
    {
        moveUp = true;
    } else {
        moveUp = false;
    }

}

// Get an element's distance from the top of the page
function getElemDistance( elem ) {
    var location = 0;
    if (elem.offsetParent) {
        do {
            location += elem.offsetTop;
            elem = elem.offsetParent;
        } while (elem);
    }
    return location >= 0 ? location : 0;
}

function handleEnd(){
        //when player takes finger off screen
        event.preventDefault();

        moveUp = false;
        moveDown = false;
        moveLeft = false;
        moveRight = false;
}

function pointAt(hunter, prey)
{
    //vel = hunter.body.velocity;
    //xDirection = hunter.body.x - prey.body.x;
    //yDirection = hunter.body.y - prey.body.y;

    //hunter.body.setVelocityX(hunter.body.x - prey.body.x);
    //hunter.body/setVelocityY(hunter.body.y - prey.body.y);

    //hunter.body.velocity = vel;

    //return 1;
}

function bounceOff(moving, stationary)
{
    if (moving.body.touching.up || moving.body.touching.down)
    {
        moving.body.setVelocityY(moving.body.velocity.y * -1);
    }
    if (moving.body.touching.left || moving.body.touching.right)
    {
        moving.body.setVelocityX(moving.body.velocity.x * -1);
    }

}


function passPlatform (player, platform)
{
    try 
    {
        if (!player.body.touching.down)
        {
            player.body.setVelocityY(-100);
        }

        if (player.body.touching.right || player.body.touching.left)
        {
            player.body.setVelocityY(-100);
        }
    } catch {

    }
}

function getBiome ()
{
    //Biomes are 1-grassland, 2-forest. 3-islands, 4-hills
    var tempNum = Math.floor(Math.random() * 4 + 1);

    switch (tempNum)
    {
        case 1: //Grassland
            biomeName = 'Grassland';

            treeHeight = 4;
            lowestBranch = 6;
            branchLength = 5;
            treeDensity = 3;

            ledgeHigh = 7;
            ledgeLow = 9;
            ledgeLength = 30;
            ledgeDensity = 2;
            solidGround = true;

            biomeSky = 'skygrassland';
            break;
        case 2: //Forest
            biomeName = 'Forest';

            treeHeight = 0;
            lowestBranch = 5;
            branchLength = 5;
            treeDensity = 6;

            ledgeHigh = 6;
            ledgeLow = 9;
            ledgeLength = 20;
            ledgeDensity = 3;
            solidGround = true;

            biomeSky = 'skyforest';
            break;
        case 3: //Islands
            biomeName = 'Islands';

            treeHeight = 0;
            lowestBranch = 0;
            branchLength = 0;
            treeDensity = 0;

            ledgeHigh = 4;
            ledgeLow = 9;
            ledgeLength = 5;
            ledgeDensity = 5;
            solidGround = false;

            biomeSky = 'skyislands';
            break;
        case 4: //Hills
            biomeName = 'Hills';

            treeHeight = 0;
            lowestBranch = 2;
            branchLength = 10;
            treeDensity = 1;

            ledgeHigh = 3;
            ledgeLow = 9;
            ledgeLength = 5;
            ledgeDensity = 7;
            solidGround = true;

            biomeSky = 'skyhills';
            break;
        default:
    }
    return biomeName;
}

function updateScore(change)
{
    score += change;
    scoreText.setText(score);
    document.getElementById("score_field").value = score;
}
