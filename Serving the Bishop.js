// All the text after the // to the end of the line is a comment and is ignored by the browser.

// Serving the Bishop game, written by Michael Souprounovich, started in December 2018

// These three variables will hold the canvas where we will draw all the images onto.
// Canvas is the canvas object. We will set its canvas.width and canvas.height to some 
// value that will be the width and height of the game screen later. Context is where we will
// draw all the images and drawings on. CanvasRect provides some important variables
// about the borders of the canvas so we can determine where the mouse was clicked, etc.
var canvas;
var context;
var canvasRect;

// Variable to check how many images have been loaded. Every time an image is loaded, it will
// add one to imagesLoaded. If imagesLoaded == totalImages then we know that all images
// have been loaded!
var imagesLoaded = 0;
var totalImages = 8;

// Here is where we will keep the image variables along with their X and Y coordinates, and 
// their Drag variable, which will check if they are being dragged by the mouse. wait is
// used to make the bishop wait at its position for however long the is specified in 
// the positions.js file.
var bishop; var bishopX; var bishopY; 
var bishopPos; var bishopWait;
var bishopEndPos = bishopPositions.length;
var bishopCrosier; // the image of the bishop with the crosier

// the image for the right hand side where all the rugs, censers, candles, etc
// will go.
var side;

// the main menu title, its sizes and position (calculated later)
var title; var titleSizeX; var titleSizeY; var titlePosX;

// the play, options ad other buttons.
var playButton; var playSizeX; var playSizeY; var playPosX; var playPosY; var playAlpha = 0;
var optButton; var optSizeX; var optSizeY; var optPosX; var optPosY; var optAlpha = 0;

// the crosier (the staff the bishop holds with the two dragon heads on the top 
// of it) and a variable to check if the bishop is currently holding it.
var crosier; var crosierPos = [12, 1]; var isHoldingCrosier = false;
var dragCrosier; // check if user is dragging the crosier with the mouse.

// The speed at which animations such as buttons when you hover the mouse on fades
// in and out. This value can be between 0 and 1, 1 being instantaneous.
var fadeSpeed = 0.2;

// The eagle rug. eagleRugs will hold an array that keeps track of all of our 
// eagle rugs in the game.
var eagleRug;
// javascript doesn't let you declare an empty array, so we need to add a random
// value then delete it.
var eagleRugs = [0];
eagleRugs.length = 0;
var maxNumRugs = 4;
// This integer lets us know whether if the user is dragging a mouse. If so, this
// value will be set to the index of the array of the rug being dragged.
var isCarryingRug = -1;
var rugPos = [12, 0];

// Checking if the user has clicked the mouse. By default the mouse is always
// "up", so mouseUp equals true, for now.
var mouseDown = false;
var mouseUp = true;
var mouseClick = false;

// Variables to check where the mouse pointer is, on the entire screen.
var mousePosX = 0;
var mousePosY = 0;

// The game state. It will keep track of what is
// currently on the screen.
var gameState = "none";

// Slows down the game to 60 FPS. It needs to know how long it took since the 
// last frame was drawn, so it can slow the computer down to maintain a stable FPS.
// Delta will keep track of how many millisecond has passed since last frame. We 
// will use this to keep the FPS capped at 60.
var FPS = 60;
var delta = 0;
var lastTimestamp = 0;

// The grid of how everything will lay out. The screen will consist of a grid x grid
// box grid. BoxSize will be determined later when we divide the screen width and 
// height by the grid.  
var grid = 13;
var boxSize;
var halfBox;

// How fast all the characters move on the canvas. Higher number = harder.
var speed = 100;

// The score. Everything you do in the game will increase the score. The amount
// increased depends on the timing. For example, if you give the bishop the 
// censer on time, you get more score. But if you're late, less score.
var score = 0;

// When the website have finished loading, the browser will automatically call
// the window.onload = function(){} function. This is our entry point.  
window.onload = function(){
	// We ask the browser for the canvas object and its context where we will
	// draw stuff on.
	canvas  = document.getElementById("mainCanvas"); 
	context = canvas.getContext("2d");
	
	// The browser gives every website the variables window.height and width,
	// which we use to determine the size of the canvas window. Here, we
	// check if the width of the window is smaller than the height.
	// If so, we set the canvas.width to the size of the window - 50.
	// The 50 is for padding - to make sure that we can see the whole game and
	// none is hidden under the left and right sides of the screen.
	// Similar if the window.height is smaller instead.
	if (window.innerHeight > window.innerWidth){
		canvas.width = Math.floor((window.innerWidth - 50) / grid) * grid;
		canvas.height = canvas.width;
	}
	else{
		canvas.height = Math.floor((window.innerHeight - 100) / grid) * grid;
		canvas.width = canvas.height;
	}
	
	// We want to know where on the screen the canvas window starts and ends.
	// This is required to work out where the user has clicked the mouse later on.
	canvasRect = canvas.getBoundingClientRect();
	boxSize = Math.round(canvas.width / grid);
	halfBox = boxSize / 2;
	
	// Calculate the optimal width+height of the main menu title.
	titleSizeX = (canvas.width / 4) * 3;
	titleSizeY = Math.floor(titleSizeX / 1.777);
	titlePosX = (canvas.width / 4) / 2;
	
	// same for all buttons.
	playPosX = boxSize * 2;                    optPosX = boxSize * 7;
	playPosY = boxSize * 8;                    optPosY = playPosY;
	playSizeX = boxSize * 4;                   optSizeX = playSizeX;
	playSizeY = Math.floor(playSizeX / 1.777); optSizeY = playSizeY;
	
	
	// Ask the browser very nicely to call the corresponding funcions when the user 
	// clicks the mouse or moves the mouse in the canvas. addEventListener()
	// asks the browser to listen for the first parameter, e.g. "mousedown", 
	// and if the user has indeed pressed the mouse button, it will call the 
	// second parameter as a function - the browser will call handleDown().
	canvas.addEventListener("mousedown", handleDown);
	canvas.addEventListener("mouseup", handleUp);
	canvas.addEventListener("mousemove", handleMove);
	canvas.addEventListener("click", handleClick);
	// Load images.
	loadImages();
	// We ask the browser to call mainLoop() whenever it's ready.
	requestAnimationFrame(mainLoop);
}

// This function will tell the browser to search for the images then load them.
function loadImages(){
	// first, we create a new Image() object.
	bishop = new Image();
	bishop.src = "images/bishop_mitre.png";  // Provide the location for it.
	// When the browser has finished loading the photo into the RAM, it will
	// call this function - .onload() for each photo. Each onload() will increment
	// imagesLoaded, and check if is is the same as totalImages. If so, we 
	// have loaded all the images!
	bishop.onload = imgLoad;
	
	eagleRug = new Image();                 side = new Image();
	eagleRug.src = "images/eagle_rug.png";  side.src = "images/side.png";
	eagleRug.onload = imgLoad;              side.onload = imgLoad;
	
	title = new Image();             playButton = new Image();
	title.src = "images/title.png";  playButton.src = "images/play.png";
	title.onload = imgLoad;          playButton.onload = imgLoad;
	
	optButton = new Image();               crosier = new Image();
	optButton.src = "images/options.png";  crosier.src = "images/crosier.png";
	optButton.onload = imgLoad;            crosier.onload = imgLoad;
	
	bishopCrosier = new Image();
	bishopCrosier.src = "images/bishop_crosier.png";
	bishopCrosier.onload = imgLoad;
		
	// Initialise the images' corresponding variables with some random values.
	resetBishop();
}

function imgLoad(){
	imagesLoaded += 1;
	if (imagesLoaded == totalImages){ 
		gameState = "main_menu"; 
	}
}

// The actual game function which aso is the all-important game loop. It sets 
// up some stuff, then calls draw() and update().
function mainLoop(time){
	// requestAnimationFrame() passes an argument to this function - the time, 
	// in milliseconds, since last time it was called. We use this to ensure 
	// that the game runs at the same speed all the time. This is complicated
	// code, it really isn't important to understand how it works.
	delta = time - lastTimestamp;
	if (delta < (1000 / FPS)){
		requestAnimationFrame(mainLoop);
		return;
	}
	lastTimestamp = time;
	
	// This function does the MAJOR part of the program - it updates the 
	// games - move around characters, etc, and draw(), well, draws everything
	// on the screen.
	update();
	
	// This function asks the browser to run mainLoop() again whenever it's ready.
	// If you have a faste computer, the browser will run the mainLoop() faster, and 
	// the browser will call mainLoop() more often each second.
	requestAnimationFrame(mainLoop);
}

// The update function. It checks for mouse changes and updates the game
// to accommodate the changes, and controls the characters and items in 
// the game. Also look up the bishopPositions array and move the bishop to
// the positions specified.
function update(){
	// Wipe the screen and start a new frame. We do this by seleting a colour, 
	// in this case hexadecimal #FFFFFF, which is 111111111111111111111111 in
	// binary and is the colour white. Then we draw a rectangle from 0, 0 to the 
	// canvas width and height. It could be any colour; but I like white :D
	context.fillStyle = "rgb(255, 255, 255)";
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// the game state is set to main menu, so let's show that.
	if (gameState == "main_menu"){
		showMainMenu();
		if (mouseClick){
			mouseClick = false;
			// we need to check if mouse is inside the "play" box.
			if (mouseIn(playPosX, playPosY, playSizeX, playSizeY)){
				gameState = "play";
				resetBishop();
				resetRugs();
				score = 0;
			}
		}
	}
	
	// Update the game.
	else if (gameState == "play"){
		// draw the side colour
		context.drawImage(side, ((grid - 1) * boxSize), 0, canvas.width, canvas.height);
		// and the border
		context.strokeStyle = "rgb(0, 0, 0)";
		context.lineWidth = 3;
		context.strokeRect(((grid - 1) * boxSize), 1, boxSize - 1, canvas.height - 2);
		// Draw the border for the top row too. This row will contain the score
		// and other stats.
		context.strokeRect(1, 1, ((grid - 1) * boxSize), boxSize);
		
		// We need to draw the eagle rug first, then the bishop over that. It 
		// would look weird if the eagle rug was drawn on the top of the bishop,
		// right?
		drawBox(eagleRug, rugPos[0], rugPos[1]);
		
		// if the user is dragging the crosier, we only want to draw the crosier
		// at the mouse position, not the right side too. There can only be one
		// crosier at any time, unlike the rugs. continue here
		if (dragCrosier){
			drawImg(crosier, mousePosX, mousePosY);
		}
		// draw the crosier on the right side
		drawBox(crosier, crosierPos[0], crosierPos[1]);
		
		// the user has clicked. We need to check if the mouse is over something
		// and then deal with it.
		if (mouseDown){
			// the user has clicked on a new rug. We need to create a new rug
			// in the array and set it to true so that it will only be drawn at
			// the mouse position.
			if (same(whichBox(mousePosX, mousePosY), rugPos) && (isCarryingRug == -1)){
				// check if number of eagle rugs exceeds maximum number.
				if (eagleRugs.length < maxNumRugs){
					// append a new rug to the end of the array, and set the third
					// value to "true", meaning the user is currently moving it.
					eagleRugs.push([0, 0, true]);
					isCarryingRug = eagleRugs.length - 1;
				}
			}
			// user has clicked on a rug already on the floor.
			else if (isCarryingRug == -1){
				var pos = rugAtPos(whichBox(mousePosX, mousePosY));
				// check if the box is not empty. If so, there is a rug on it.
				if (pos > -1){
					isCarryingRug = pos;
					eagleRugs[pos][2] = true;
				}
			}
		}
		
		// the user has let go of the left mouse button (LMB), so we drop the 
		// rug at the desired block.
		if (isCarryingRug > -1){
			if (mouseUp){
				// if the user has dropped the rug at the right side, we 
				// delete that rug, by going through the rugs array and find the 
				// "active" one (ie, the third value is true) and delete it.
				if (whichBox(mousePosX, mousePosY)[0] == rugPos[0]){
					eagleRugs.splice(isCarryingRug, 1);
				}
				else{
					// We set the box coords (NOT the canvas coords!) of the current
					// rug to the mouse position, and set it to false - meaning the 
					// user has officially dropped it into place.
					var pos = whichBox(mousePosX, mousePosY);
					// first, we call emptyAtPos() to make sure that there is nothing
					// on the floor.
					if (rugAtPos(pos) == -1 || rugAtPos(pos) == isCarryingRug){
						eagleRugs[isCarryingRug][0] = pos[0];
						eagleRugs[isCarryingRug][1] = pos[1];
						eagleRugs[isCarryingRug][2] = false;
					}
					
					// there is already a rug on the floor, so nope, delete the 
					// rug the user has dropped.
					else{
						eagleRugs.splice(isCarryingRug, 1);
					}
				}
				isCarryingRug = -1;
			}
			else{
				drawImg(eagleRug, (mousePosX - halfBox), (mousePosY - halfBox));
			}
			
		}
		
		// Goes through all the rugs in the array. 1st, check if the last value
		// is a FALSE - meaning that the rug is just sitting there. It is not 
		// being dragged around by the mouse.
		for (i = 0; i < eagleRugs.length; i++){
			if (!eagleRugs[i][2]){
				drawBox(eagleRug, eagleRugs[i][0], eagleRugs[i][1]);
			}
		}
		
		// We want the bishop to start at the first position instantaneously, not
		// at (0, 0) and slowly move to the first position.
		if (bishopPos == 0){
			bishopX = bishopPositions[0][0] * boxSize;
			bishopY = bishopPositions[0][1] * boxSize;
		}
		
		// we need to check if the bishop is holding the crosier. If so, we need 
		// to draw a slightly different version of the bishop image - to the one
		// with the crosier.
		if (isHoldingCrosier){
			// We draw the bishop at its x and y variables.
			drawImg(bishopCrosier, bishopX, bishopY);
		}
		else{
			drawImg(bishop, bishopX, bishopY);
		}
		
		// Check if the game has finished. We do this by checking if we has reached
		// the end of the bishop positions array, given in the positions.js file.
		if (bishopPos < bishopEndPos){
			var nextPos = bishopPositions[bishopPos];
			
			// If the next command is "wait", then we wait, by checking how long
			// it took to display the next frame. We add it to a counter, each 
			// frame. Then we need to check if the counter is bigger than the
			// desired bishop wait time. If so, we have finished waiting so we 
			// can move on to the next command.
			if(nextPos[0] == "wait"){
				bishopWait += delta;
				if (bishopWait > (nextPos[1] * 1000)){
					bishopPos++;
				}
			}
			
			else{
				bishopWait = 0;
				
				// This block of code below changes the bishop's X and Y 
				// coordinates based on where the bishop is heading.
				// First, we need to check if the desired position is to the
				// left or right, above or below of the bishop. Then we need to 
				// change the bishop's x and y coords by a little bit, moving 
				// it closer to the position. We do this every frame until the
				// bishop has arrived at the position.
				var x = (nextPos[0] * boxSize); var y = (nextPos[1] * boxSize);
				if (bishopX > x){ 
					bishopX -= (speed / FPS);
					if (bishopX < x){ bishopX = x; }
				}
				else if (bishopX < x){ 
					bishopX += (speed / FPS);
					if (bishopX > x){ bishopX = x; }
				}
				
				if (bishopY > y){ 
					bishopY -= (speed / FPS);
					if (bishopY < y){ bishopY = y; }
				}
				else if (bishopY < y){ 
					bishopY += (speed / FPS);
					if (bishopY > y){ bishopY = y; }
				}
				
				// if the bishop has arrived at the next position, then we increment
				// the bishop position counter.
				if (bishopX == x && bishopY == y){ 
					bishopPos++; 
					
					// Does the next command include more than 2 variables? (remember,
					// the first two are the x and y coords)
					if (nextPos.length > 2){
						// Does the bishop need something whilst at this position?
						if (nextPos[2] == "requires"){
							// A rug should be at this position. If so, add the score
							// specified in the next variable. If not, you failed.
							if (nextPos[3] == "rug"){
								if (rugAtPos([nextPos[0], nextPos[1]]) > -1){
									score += nextPos[4];
								}
							}
						}
					}
				}
			}
			
			// This draws an outline of the box that the mouse is currently hovering over.
			drawCursor();
			drawScore();
		}
		else{
			// the game has finished.
			gameState = "end"
		}
	}
	// When the game has finished, we want to go back to the main menu.
	else if (gameState == "end"){
		gameState = "main_menu";
		mouseClick = false;
	}
}

// This function handles the mouse click. It simply turns two Booleans the opposite way.
function handleDown(event){
	mouseUp = false;
	mouseDown = true;
}

// Exact opposite as above.
function handleUp(event){
	mouseDown = false;
	mouseUp = true;
}

function handleClick(event){
	mouseClick = true;
}

// This function handles the mouse movement. It simply updates the mousePosX and Y.
// The browser passes a variable to it called event. It has the properties pageX and 
// pageY which gives the coords of the mouse for the entire window, so we need to 
// subtract the position of the canvas window, from it. Funnily enough, my browser
// seemed to subtract the mouse positions by 0.5, so I added it back.
function handleMove(event){
	mousePosX = event.pageX - canvasRect.left + 0.5;
	mousePosY = event.pageY - canvasRect.top + 0.5;
}

// Draws an image on the desired box. It accepts the box - X and Y coordintes.
// Remember, how many boxes on the screen is determined by grid. And the size
// of each box is determined by boxSize. So to determine the canvas x and y coords
// to draw the image, we multiply the size of the box by the the X and Y coord of the box.
function drawBox(image, x, y){
	var posX = boxSize * x;
	var posY = boxSize * y;
	context.drawImage(image, posX, posY, boxSize, boxSize);
}

// Syntatic sugar. In programming, it means to shorten a long line. Which one would
// you prefer: context.drawImage(image, x, y, boxSize, boxSize); or drawImg(image, x, y);?
function drawImg(image, x, y){
	context.drawImage(image, x, y, boxSize, boxSize);
}

// Draws an outline of the box which the cursor is currently in. It uses the function
// whichBox(), which accepts a x,y positions on the canvas, and returns which box it 
// is currently in.
function drawCursor(){
	var tmp = whichBox(mousePosX, mousePosY);
	// Draw a outline of a box.
	context.strokeStyle = "rgb(0, 0, 0)";
	context.lineWidth = 2;
	context.strokeRect((tmp[0] * boxSize), (tmp[1] * boxSize), boxSize, boxSize);
}

// The function accepts a x and y coordinate of the canvas then returns the box
// which it lies on.
function whichBox(canvasX, canvasY){
	return[Math.floor(canvasX/boxSize), Math.floor(canvasY/boxSize)];
}

// Another syntatic sugar. This time, it compares the first two values of an array
// and if they are identical, it returns a single true. NOT AN ARRAY!
function same(array1, array2){
	return((array1[0] == array2[0]) && (array1[1] == array2[1]))
}

function showMainMenu(){
	// Draw "Serving the Bishop" on the middle of the screen.
	context.drawImage(title, titlePosX, 0, titleSizeX, titleSizeY);
	// Draw the play button. The otline is drawn too. Depending on the alpha 
	// value, it may or may not be invisible. The code below checks if the mouse
	// is inside the box. If so, 
	context.drawImage(playButton, playPosX, playPosY, playSizeX, playSizeY);
	context.strokeStyle = "rgba(255, 255, 0, " + playAlpha + ")";
	context.lineWidth = 8;
	context.strokeRect(playPosX, playPosY, playSizeX, playSizeY);
	
	context.drawImage(optButton, optPosX, optPosY, optSizeX, optSizeY);
	context.strokeStyle = "rgba(255, 255, 0, " + optAlpha + ")";
	context.strokeRect(optPosX, optPosY, optSizeX, optSizeY);
	
	// we check if the mouse is hovering over the play button. If so, we draw a
	// yellow outline of it to show the player that he/she is selecting it.
	if (mouseIn(playPosX, playPosY, playSizeX, playSizeY)){
		if (playAlpha < 1){ playAlpha += fadeSpeed; }
	}
	else if (playAlpha > 0){ playAlpha -= fadeSpeed; }
	
	// Same for options button.
	if (mouseIn(optPosX, optPosY, optSizeX, optSizeY)){
		if (optAlpha < 1){ optAlpha += fadeSpeed; }
	}
	else if (optAlpha > 0){ optAlpha -= fadeSpeed; }
}

// reset the bishop variables back to default states, ready for a new game.
function resetBishop(){
	bishopX = 0;
	bishopY = 0;
	bishopPos = 0;
	bishopWait = 0;
}

// Delete all rugs.
function resetRugs(){
	eagleRugs = [0];
	eagleRugs.length = 0;
	isCarryingRug = -1;
}

// This function accepts a array for input. It checks the first two values of it,
// which it assumes are the x and y coords for a box on the canvas. It then goes
// through all the eagle rugs, checking if each of them is lying on the exact same
// place. If so, it returns the index number of the rug in the array. Otherwise,
// a -1.
function rugAtPos(box){
	for (i = 0; i < eagleRugs.length; i++){
		if (same(box, eagleRugs[i])){
			return i;
		}
	}
	return -1;
}

// Draws the score at the top left.
function drawScore(){
	context.fillStyle = "rgb(0, 0, 0)";
	context.font = "20px Verdana";
	context.textAlign = "left";
	context.fillText("Score: " + score, (boxSize / 4), ((boxSize / 3) * 2));
}

// This function accepts four inputs: the x and y coords of a box on the canvas, and
// the width and height of the box. It will then check the mouse positions and if 
// they are inside the box, then return true.
function mouseIn(x, y, width, height){
	// check if the mouse x position is between the left and right sides x coords
	// of the box.
	var isInX = (mousePosX > x) && (mousePosX < (x + width));
	// Similar to the x position, but we check if the mouse is inside the top and
	// bottom side of the box.
	var isInY = (mousePosY > y) && (mousePosY < (y + height));
	// If both values are true, then we return true with an AND operator.
	return isInX && isInY;
}
