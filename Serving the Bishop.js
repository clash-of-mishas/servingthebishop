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
var totalImages = 1;

// Here is where we will keep the image variables along with their X and Y coordinates, and 
// their Drag variable, which will check if they are being dragged by the mouse. wait is
// used to make the bishop wait at its position for however long the is specified in 
// the positions.js file.
var bishop; var bishopX; var bishopY; 
var bishopPos; var bishopWait; var bishopFacing;
var bishopEndPos = bishopPositions.length;

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

// Slows down the game to 30 FPS. It needs to know how long it took since the 
// last frame was drawn, so it can slow the computer down to maintain a stable FPS.
// Delta will keep track of how many millisecond has passed since last frame. We 
// will use this to keep the FPS capped at 30.
var FPS = 60;
var delta = 0;
var lastTimestamp = 0;

// The grid of how everything will lay out. The screen will consist of a grid x grid
// box grid. BoxSize will be determined later when we divide the screen width and 
// height by the grid.  
var grid = 12;
var boxSize;

// How fast all the characters move on the canvas. Higher number = harder.
var speed = 100;

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
	bishop.onload = function(){ 
		imagesLoaded += 1;
		if (imagesLoaded == totalImages){ 
			gameState = "main_menu"; 
		}
	}
		
	// Initialise the images' corresponding variables with some random values.
	resetBishop();
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
	context.fillStyle = "#FFFFFF";
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// the game state is set to main menu, so let's show that.
	if (gameState == "main_menu"){
		showMainMenu();
		if (mouseClick){
			mouseClick = false;
			gameState = "play";
			resetBishop();
		}
	}
	
	// Update the game.
	else if (gameState == "play"){
		// We draw each images at its x and y variables.
		drawImg(bishop, bishopX, bishopY);
		// This draws an outline of the box that the mouse is currently hovering over.
		drawCursor();
		
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
				
				if (bishopX == x && bishopY == y){ bishopPos++; }
			}
		}
		else{
			// the game has finished.
			gameState = "end"
		}
	}
	
	else if (gameState == "end"){
		alert("Game over!");
		gameState = "main_menu";
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
	context.strokeRect((tmp[0] * boxSize), (tmp[1] * boxSize), boxSize, boxSize);
}

// The function accepts a x and y coordinate of the canvas then returns the box
// which it lies on.
function whichBox(canvasX, canvasY){
	return[Math.floor(canvasX/boxSize), Math.floor(canvasY/boxSize)];
}

// Another syntatic sugar. This time, it compares the first two values of an array
// and if they are identical, it returns true.
function same(array1, array2){
	return((array1[0] == array2[0]) && (array1[1] == array2[1]))
}

function showMainMenu(){
	// Draw "Serving the Bishop" on the middle of the screen.
	context.fillStyle = "#000000";
	context.font = "40px Verdana";
	context.textAlign = "center";
	context.fillText("Serving the Bishop", (canvas.width / 2), (canvas.width / 6));
	
	// TODO: Add buttons for play, options, highscores and credits.
}

function resetBishop(){
	bishopX = 0;
	bishopY = 0;
	bishopPos = 0;
	bishopWait = 0;
	bishopFacing = "north";
}
