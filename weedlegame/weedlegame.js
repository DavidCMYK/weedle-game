var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    //parent: 'game_div',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game_div',
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: 1200,
        height: 600
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

//mob groups
var player;
var pidgeys;
var magikarps;
var geodudes;

//image and terrain groups
var skies;
var backgrounds;
var sun;
var bottomLedges;
var otherLedges;
var arrLedges = {};
var ledgeCount = 0;
var backGrasses;
var frontGrasses;
var Leaves;
var branches;
var trunks;
var berries;

//game object groups
var pokeballs;

//game mechanics
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var moveRight, moveLeft, moveUp, moveDown;
var gameCanvas;
var initialCanvasHeight;
var prevHeight;
var mainCamera;
var ledgeCollider;
var initialSpawnCheck;
var maxButton;
var gameOverScreen;

//dials
var worldWidth = 20000;
var minBiomeLength = 400;
var worldHeight = 600;
var worldLayers = 9;
var layerHeight = Math.floor(worldHeight/worldLayers)-1;
var maxScreenWidth = 1400;

//biomes
var Biome;
var treeHeight, lowestBranch, branchLength, treeDensity, ledgeHigh, ledgeLow, ledgeLength, ledgeDensity, solidGround;
var biomeSky;

function preload ()
{
    console.log('preload');
    this.load.image('skygrassland', 'weedlegame/assets/skygrassland.png');
    this.load.image('skyislands', 'weedlegame/assets/skyislands.png');
    this.load.image('skyforest', 'weedlegame/assets/skyforest.png');
    this.load.image('skyhills', 'weedlegame/assets/skyhills.png');
    this.load.image('backgroundForest', 'weedlegame/assets/backgroundforest.png');
    this.load.image('backgroundGrassland', 'weedlegame/assets/backgroundgrassland.png');
    this.load.image('backgroundHills', 'weedlegame/assets/backgroundhills.png');
    this.load.image('backgroundIslands', 'weedlegame/assets/backgroundislands.png');
    this.load.image('sun', 'weedlegame/assets/sun.png');
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
    this.load.spritesheet('weedle', 'weedlegame/assets/weedle.png', { frameWidth: 64, frameHeight: 50 });
    this.load.spritesheet('weedleair', 'weedlegame/assets/weedleair.png', { frameWidth: 32, frameHeight: 50 });
    this.load.spritesheet('weedletall', 'weedlegame/assets/weedletall.png', { frameWidth: 32, frameHeight: 50 });

    this.load.spritesheet('pidgey', 'weedlegame/assets/pidgey.png', { frameWidth:73, frameHeight: 55 });
    this.load.spritesheet('magikarp', 'weedlegame/assets/magikarp.png', { frameWidth:93, frameHeight: 77 });
    this.load.spritesheet('geodude', 'weedlegame/assets/geodude.png', { frameWidth:85, frameHeight: 32 });

    this.load.spritesheet('maxmin', 'weedlegame/assets/maxmin.png', { frameWidth:64, frameHeight: 64 });
    this.load.image('gameover', 'weedlegame/assets/gameover.png');
}

function create ()
{
    console.log('create');
    gameOver =false;
    score = 0;
    //game canvas object
    gameCanvas = document.getElementsByTagName("canvas")[0];

    initialCanvasHeight = gameCanvas.height;

    //event listeners for touch controls
    gameCanvas.addEventListener("touchstart", handleTouch, false);
    gameCanvas.addEventListener("touchmove", handleTouch, false);
    gameCanvas.addEventListener("touchend", handleEnd, false);
    gameCanvas.addEventListener("touchcancel", handleEnd, false);

    //set the game_div height to something sensible
    document.getElementById("game_div").style.height = (gameCanvas.height + 50) + "px";
    
    //  Keyboard input Events
    cursors = this.input.keyboard.createCursorKeys();
    
    //Add camera
    mainCamera = this.cameras.main;
    mainCamera.setSize(gameCanvas.width, gameCanvas.height);
    mainCamera.setBounds(0, 0, worldWidth, 600);
    mainCamera.setPosition(0,initialCanvasHeight-gameCanvas.height);
    mainCamera.roundPixels = true;

    //  The bottomLedges group contains the ground at the bottom of the screen
    //in a separate group as collisions are handled differently
    bottomLedges = this.physics.add.staticGroup();

    //The otherLedges group contains the ground ledges except the bottom one
    otherLedges = this.physics.add.staticGroup();

    //groups to hold game objects
    backGrasses = this.add.group();
    frontGrasses = this.add.group();
    soils = this.add.group();
    waters = this.physics.add.staticGroup();
    skies = this.add.group();
    backgrounds = this.add.group();
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
    arrLedges = []; //empty the ledge array in case of a restart

    //create a starting ledge
    addLedge(15,7,3);
    // place weedle on the first ledge
    player = this.physics.add.sprite(20, 7*layerHeight-40, 'weedle');

    //Define sections of the world as unique biomes
    while (biomeStart < worldWidth)
    {
        biomeLength = minBiomeLength + 400 * Math.round(Math.random() * 10);
        Biome = getBiome();

        //create one ledge which runs across the bottom of the screen, except in Islands biomes
        if (solidGround)
        {
            addLedge(biomeStart, 9, biomeLength/30);
        }
        else
        {
            //create water where there's no land
            for (i=0; i<biomeLength/30; i++)
            {
                waterX = biomeStart + i*30;
                waters.create(waterX, worldHeight-5, 'water');
                //randomly spawn magikarp
                if (i>3 && Math.random() < 0.05)
                {
                    magikarps.create(waterX, 300+Math.random()*240, 'magikarp');
                }
            }
        }

        //set the positions for the ledges and load the background images
        for (ledgeNo=0; ledgeNo<ledgeDensity*biomeLength/400; ledgeNo++)
        {
            //set the starting point of the next ledge
            xLedge = Math.floor(biomeStart + Math.random() * biomeLength);
            yLedge = Math.floor(ledgeHigh + Math.round(Math.random() * (ledgeLow - ledgeHigh))) * (layerHeight); //the bottom ledge should be slightly above ground/water
            ledgeLayer = ledgeHigh + Math.round(Math.random() * (ledgeLow - ledgeHigh));
            
            thisLedgeLength = Math.random() * ledgeLength * 2; //number of segments in the current platform
            
            //Create a ledge. Ledge positions are held in the arrLedges object for pre-processing before adding to the game world
            addLedge(xLedge, ledgeLayer, thisLedgeLength);

            //add Geodudes to Hill biomes
            if (Biome=='Hills' && Math.random() < 0.1 && xLedge > 200)
            {
                createGeodude(xLedge, yLedge - 30);
            }
        }

        //  Add trees
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
                    thisBranchLength = Math.round(Math.random() * branchLength) +1; //no 0-length branches for tree-tops
                } else {
                    thisBranchLength = Math.round(Math.random() * branchLength);
                }
               
                //set starting point of branch
                xBranch = xTree - thisBranchLength * 30 / 2;
                yBranch = (i) * layerHeight;

                //create branch segments
                for (j=0; j<=thisBranchLength; j++)
                {
                    branches.create(xBranch, yBranch, 'platform');
                    
                    //add leaves
                    Leaves.create(xBranch, yBranch + (Math.random()*20-10), 'leaves' + Math.round((Math.random()*2) +1));

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
            skies.create(biomeStart -1000 + 400 * i, 300, biomeSky);

            backgrounds.create(biomeStart -100 + 400 * i, 300, 'background' + Biome);

            //add pidgeys in the clear skies
            if (Biome!='Forest' && Math.random()<0.2)
            {
                if (biomeStart < 400)
                {
                    
                    createPidgey(biomeStart + 400 + 100 * i,Math.random()*ledgeHigh*layerHeight);
                } else {
                    createPidgey(biomeStart + 100 + 400 * i,Math.random()*ledgeHigh*layerHeight);
                }
            }
        }
        //the start of the next biome is the end of this one
        biomeStart = biomeStart + biomeLength;
    }

    //Add the sun
    sun = this.physics.add.image(mainCamera.centreX, worldHeight/2, 'sun');
    sun.body.setAllowGravity(false);

    //check for any impossible gaps between islands
    var nextLedge = {};
    var jumpDistance;

    //iterate through all existing ledges
    Object.keys(arrLedges).forEach((key, index) => {
        ledgeX = arrLedges[key]['x'];
        ledgeLayer = arrLedges[key]['layer'];

        //search ahead from the current ledge to find the next reachable one
        currentX = ledgeX + 1;
        ledgeFound = false

        if (currentX < worldWidth) //stop when the end of the world is reached
        {
            while (!ledgeFound && currentX < worldWidth) //stop when the next reachable ledge is found
            {
                for (j = ledgeLayer - 1; j <= worldLayers; j++) //reachable is defined as a ledge no more than 1 level higher than the current one
                {
                    if (arrLedges[currentX + ':' + j])//check if a ledge exists at each possible coordinate set right of the current
                    {
                        ledgeFound = true;
                        nextLedge = arrLedges[currentX + ':' + j];
                    }
                }
                if (!ledgeFound)
                {
                    //if no ledge found at this x, move on
                    currentX++;
                }
            }
        }

        //create a bridging ledge if needed
        if (nextLedge) //don't crash if no nextLedge (e.g. at end of world)
        {
            jumpDistance = 200 + (nextLedge['layer']-ledgeLayer) * 50; // rough estimate of how far player can jump
            if (nextLedge['x'] - ledgeX > jumpDistance) //if the next reachable ledge is too far to jump
            {
                addLedge(ledgeX + jumpDistance, ledgeLayer, Math.max(Math.ceil((nextLedge['x']-ledgeX-jumpDistance*2)/30),1));
            }
        }
    })

    //put all of the ledges into the world
    for (currentLayer = 0; currentLayer <= worldLayers; currentLayer++)
    {
        Object.keys(arrLedges).forEach((key, index) => {
            if (key.includes(':'+currentLayer.toString(), 1))
            {
                createLedge(arrLedges[key]['x'], arrLedges[key]['layer']*layerHeight);
            }
        })
    }

    //Display the score
    scoreText = this.add.text(16, 16, '0', { fontSize: '32px', fill: '#FFF' });

    //Set the depth for each set of objects
    setDepth(skies,0);
    sun.depth = 1;
    setDepth(backgrounds,2);
    setDepth(trunks,3);
    setDepth(soils,4);
    setDepth(otherLedges,5);
    setDepth(bottomLedges,6);
    setDepth(backGrasses,7);

    //insert the player into this layer
    player.depth = 8;

    // land enemies here
    setDepth(geodudes,9);
    setDepth(pidgeys,10);

    //Collectables here
    setDepth(pokeballs,11);
 
    setDepth(branches,12);
    setDepth(frontGrasses,13);
    setDepth(berries,14);

    //player will be at depth 15 when jumping/dropping

    setDepth(Leaves,16);

    setDepth(magikarps,17);

    setDepth(waters,18);

    //text objects on top
    scoreText.depth = 19;

    //full screen button
    maxButton = this.add.sprite(50, 50, 'maxmin', 0).setOrigin(1, 0).setInteractive();
    maxButton.depth = 20;

    //Game Over/ reset button
    gameOverScreen = this.add.image(-1000,-1000, 'gameover').setInteractive();
    gameOverScreen.depth = -1;


    //camera follows player
    mainCamera.startFollow(player);
    
    //  Create the player animations
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

    //frames for maxmin button
    this.anims.create({
        key: 'max',
        frames: [ { key: 'maxmin', frame: 0 } ],
        frameRate: 5
    });
    this.anims.create({
        key: 'min',
        frames: [ { key: 'maxmin', frame: 1 } ],
        frameRate: 5
    });

    // set behaviour of max/min button
    maxButton.on('pointerup', function (pointer) {

        if (this.scale.isFullscreen)
        {
            maxButton.anims.play('max',true);

            this.scale.stopFullscreen();
        }
        else
        {
            maxButton.anims.play('min',true);

            this.scale.startFullscreen();
        }
    }, this);

    // set behaviour of reset button
    gameOverScreen.on('pointerup', function (pointer) {
        console.log('reset clicked')
        this.scene.restart();
    }, this);

    //play water animation
    waters.children.iterate(function (child) {
        child.anims.play('watermove',true);
    });

    //  Collide the player and the ledges and branches
    this.physics.add.collider(player, bottomLedges);
    ledgeCollider = this.physics.add.collider(player, otherLedges);
    this.physics.add.collider(player, branches, passPlatform, null, this);

    //Collide Pidgeys with ledges and branches
    this.physics.add.collider(pidgeys, bottomLedges);
    this.physics.add.collider(pidgeys, otherLedges);
    this.physics.add.collider(pidgeys, branches);

    //destroy any pidgeys that spawn inside a branch
    initialSpawnCheck = this.physics.add.overlap(pidgeys, branches, destroyFirst, null, this);

    //Enemies that hit Weedle cause death
    this.physics.add.collider(player, pidgeys, suddenDeath, null, this);
    this.physics.add.collider(player, magikarps, suddenDeath, null, this);
    this.physics.add.collider(player, geodudes, suddenDeath, null, this);
    this.physics.add.overlap(player, waters, suddenDeath, null, this);

    //make sure pokeballs can't fall through ledges
    this.physics.add.collider(pokeballs, bottomLedges);
    this.physics.add.collider(pokeballs, otherLedges);

    //  Checks to see if the player overlaps with any of the collectables, if he does call the collectPokeball function
    this.physics.add.overlap(player, pokeballs, collectPokeball, null, this);
    this.physics.add.overlap(player, berries, collectPokeball, null, this);
}

function update ()
{
    var correctAnim; //holds the name of the correct player animation for the current circumstances
    var moved; //true if the player has moved this update

    //stop updating if player dead
    if (gameOver)
    {
        return;
    }

    //make sure the game div is only as large as necessary
    document.getElementById("game_div").style.height = (game.scale.displaySize.height + 10) + "px";

    //Kill weedle if drops off bottom of screen somehow
    if (player.body.y > worldHeight)
    {
        suddenDeath(player, player);
    }

    //animate pidgeys
    pidgeys.children.iterate(function (child) {
        if (child.body.velocity.x > 0)
        {
            child.anims.play('pidgeyright',true);
        } else {
            child.anims.play('pidgeyleft',true);
        }

        //check if pidgeys are within range of weedle, if so, swoop down
        if (Phaser.Math.Distance.Between(player.body.x, player.body.y, child.body.x, child.body.y) < 300)
        {
            child.body.setVelocityY((player.body.y - child.body.y) * 2);
        } else if (Math.abs(child.body.x - player.body.x) < 400 && child.body.velocity.y < 20 && player.body.y > child.body.y) {
            //if pidgey above weedle, start lowering
                child.body.velocity.y += 1;
        } else if (Math.abs(child.body.x - player.body.x) < 500 && ((player.body.velocity.x > 0 && child.body.velocity.x <0 && player.body.x > child.body.x) || (player.body.velocity.x < 0 && child.body.velocity.x > 0 && player.body.x < child.body.x))) {
            //circle and follow weedle if it's moving
            child.body.setVelocityX(child.body.velocity.x * -1);
        } else if (child.body.y>layerHeight) {
            //otherwise rise back up to the top of the world
            child.body.velocity.y += -1;
        }

        // stop pidgey flying off the top of the world
        if (child.body.y < 40 && child.body.velocity.y < 0)
        {
            child.body.setVelocityY(0);
        }

        //bounce pidgeys off world end
        if (child.body.x < 0 || child.body.x > worldWidth)
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
        //randomly change direction, unless weedle is in range, then move towards weedle
        if ((separation > 50 && separation < 200 && child.body.velocity.x < 0) || (separation < -50 && separation > -200 && child.body.velocity.x > 0))
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }
        else if (Math.random()<0.03)
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }

        //bounce geodude off world end
        if ((child.body.x < 0 && child.body.velocity.x < 0) || (child.body.y > worldWidth && child.body.velocity.x > 0))
        {
            child.body.setVelocityX(child.body.velocity.x * -1);
        }

    });

    //Move magikarp
    magikarps.children.iterate(function (child) {
        if (child.body.y > worldHeight - 0 && child.body.velocity.y > 0)
        {
            child.body.setVelocityY(-10);
            child.body.setAllowGravity(false);
        }
        else if (child.body.y < worldHeight - 30 && child.body.y > worldHeight - 50 && child.body.velocity.y < -9)
        {
            child.body.setVelocityY(-(layerHeight + Math.random() * worldHeight));
            child.body.setAllowGravity(true);
        }
    });

    //basic weedle movement. moveLeft, moveRight, etc are set by touch controls on mobile
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

    //jump weedle when up key pressed
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
    if (cursors.down.isDown || moveDown)
    {
        try {
            ledgeCollider.destroy();
            ledgeCollider = null;
            player.depth = 15;
        } catch {}
    } else {
        if (!ledgeCollider)
        {
            ledgeCollider = this.physics.add.collider(player, otherLedges);
        }
    }

    //pass through ledges horizontally while jumping or dropping
    if ((cursors.up.isDown || cursors.down.isDown) || (moveUp || moveDown))
    {
        otherLedges.children.iterate(function (child) {
            if (child.body.y < (worldHeight - layerHeight))
            {
                child.body.checkCollision.right = false;
                child.body.checkCollision.left = false;
            }
        });
        player.depth = 15;
    }
    else if (player.body.touching.down || player.body.touching.up)
    {
        otherLedges.children.iterate(function (child) {
            child.body.checkCollision.right = true;
            child.body.checkCollision.left = true;
        });
        player.depth = 8;
    }

    //set the correct animation for weedle based on what it's doing
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

    //move the score counter
    scoreText.x = player.x ;
    scoreText.y = player.y -60;

    //move the sun
    if (player.x > mainCamera.centerX && player.x < worldWidth - mainCamera.centerX)
    {
        sun.x = player.x;
    } else {
        sun.x = mainCamera.scrollX + mainCamera.centerX
    }

    maxButton.x = mainCamera.scrollX + 100;

    //destroy any pidgeys stuck inside branches
    try
    {
        initialSpawnCheck.destroy();
    }catch{}
}

function createGeodude(x, y, leftLimit, rightLimit)
{
    newGeodude = geodudes.create(+x, y, 'geodude');
    newGeodude.body.setAllowGravity(false);
    newGeodude.setBounce(0);
    newGeodude.body.setVelocityX(30 + Math.random() *50);
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

function addLedge(x, layer, length){

    var ledgeNeeded;

    for (i=0; i<length; i++)
    {
        ledgeNeeded = true;

        currX = x + i * 30;
        for (j=currX-29; j<=currX; j++)
        {
            if (arrLedges[j+':'+layer])
            {
                ledgeNeeded = false;
            }
        }
        if (ledgeNeeded)
        {
            arrLedges[currX + ':' + layer] = {'x': currX, 'layer': layer};
        }

    }
}

function createLedge(x, y){

        //add ledge
        if (y > (worldLayers - 1) * layerHeight)
        {
            newLedge = bottomLedges.create(x, y, 'ledge');
    } else {
            newLedge = otherLedges.create(x, y, 'ledge');
            //ledgeCount = y;
        }
        //ledgeCount = y;
        //document.getElementById("test_area").innerHTML = ledgeCount;

        newLedge.body.checkCollision.down = false;

        //add grass
        backGrasses.create(x, y-30, 'grass' + Math.round((Math.random()*2) +1));
        frontGrasses.create(x, y-10, 'grassfront' + Math.round((Math.random()*2) +1));

        //add soil background
        soils.create(x, y+260, 'soil');

        //random chance to add pokeball
        if (Math.random() < 0.04 * (worldLayers - y/layerHeight))
        {
            pokeballs.create(x, y - 40, 'pokeball');
        }
}

function replacePokeball (pokeball, water)
{
    pokeball.destroy();

}

function suddenDeath (player, enemy)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('standair');

    gameOverScreen.setPosition(mainCamera.scrollX + 600, mainCamera.scrollY+300);
    gameOverScreen.depth = 25;

    if ( (document.getElementById('name_field').value != '') && (document.getElementById('email_field').value != '') && gameOver == false )
    {
        sendScore();
    }

    gameOver = true;

}

function destroyFirst(toDestroy, Other) {
    toDestroy.destroy();
}

function handleTouch(event){
    //establish mobile controls
    var touchRadius = layerHeight;
    var yOffset = -0;
    var xOffset = 0;
    var elem = document.querySelector('canvas');
    var heightMultiplier = elem.height/game.scale.displaySize.height;
    var widthMultiplier = elem.width/game.scale.displaySize.width;
    var vpOffset = elem.getBoundingClientRect();
    var topPos = vpOffset.top;

    event.preventDefault();

    var touchX = (event.changedTouches[0].pageX - gameCanvas.offsetLeft) * widthMultiplier + mainCamera.scrollX;
    var touchY = (event.changedTouches[0].pageY - topPos) * heightMultiplier;

    if (touchX > player.body.x + xOffset + touchRadius)
    {
        moveRight = true;
    } else {
        moveRight = false;
    }

    if (touchX < player.body.x + xOffset - touchRadius)
    {
        moveLeft = true;
    } else {
        moveLeft = false;
    }

    if (touchY > player.body.y + yOffset + touchRadius)
    {
        moveDown = true;
    } else {
        moveDown = false;
    }

    if (touchY < player.body.y + yOffset - touchRadius)
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

            treeHeight = 6;
            lowestBranch = 7;
            branchLength = 5;
            treeDensity = 1;

            ledgeHigh = 8;
            ledgeLow = 9;
            ledgeLength = 10;
            ledgeDensity = 1;
            solidGround = true;

            biomeSky = 'skygrassland';
            break;
        case 2: //Forest
            biomeName = 'Forest';

            treeHeight = 0;
            lowestBranch = 5;
            branchLength = 5;
            treeDensity = 6;

            ledgeHigh = 7;
            ledgeLow = 9;
            ledgeLength = 10;
            ledgeDensity = 4;
            solidGround = true;

            biomeSky = 'skyforest';
            break;
        case 3: //Islands
            biomeName = 'Islands';

            treeHeight = 0;
            lowestBranch = 0;
            branchLength = 0;
            treeDensity = 0;

            ledgeHigh = 5;
            ledgeLow = 9;
            ledgeLength = 4;
            ledgeDensity = 3;
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
            ledgeDensity = 4;
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

function setDepth(group, depth) {
    group.children.iterate(function (child) {
        child.depth = depth;
    });
}

//testing jQuery for scores:
function sendScore() {

    var name = document.getElementById('name_field').value;
    var email = document.getElementById('email_field').value;

    jQuery.ajax({
        type: "POST",
        url: '//gopins.co.uk/games/send-score.php',
        dataType: 'json',
        data: {player_score: score, player_name: name, player_email: email},
    
        success: function (obj, textstatus) {
                          console.log('Success: ' + obj.error);
                },

        error: function (obj, textStatus, errorThrown) {
            console.warn(obj.responseText)
            console.log('Error: ' + obj.errror + ' | ' + textStatus + ' | ' + errorThrown);
        }
    });
}
