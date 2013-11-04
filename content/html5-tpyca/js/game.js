/// <reference path="canvas-vsdoc.js" />
/* 
	http://canvasvsdoc.codeplex.com/
*/

/*
	Included with the permisson of Jonathan Evans (@joneapple on Twitter)
*/

var width = 640, height = 480, canvas = null, ctx = null;
var x = 0, y = 0, vel_x = 0, vel_y = 0, prevTime = 0;
var keys = new Array();

// Key constants
KEY_SPACE = 87; //32;
KEY_LEFT = 65; //37;
KEY_UP = 38;
KEY_RIGHT = 68; //39;
KEY_DOWN = 40;

// Game constants
MAX_VELOCITY = 12;
ACCELERATION_RATE = 2;
GRAVITY_RATE = 2;
JUMP_VELOCITY = -18; // negative # to go up
FPS = 60;
PLAYER_SIZE = 50
var FLOOR = 320;

window.onload = init;

function init()
{
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');
	
	setTimeout(gameloop, 1000 / FPS);
	
	FLOOR = canvas.height - (canvas.height % 32);

	setInterval(gameloop, 1000 / FPS);
}

function gameloop()
{
	update();
	draw();
	
	//setTimeout(gameloop, 1000 / FPS);
}

function update()
{
	// Handle left/right movement
	
	if(keys[KEY_LEFT] == true)
	{
		vel_x = (vel_x < -MAX_VELOCITY) ? -MAX_VELOCITY : vel_x - ACCELERATION_RATE;
	}
	else if(keys[KEY_RIGHT] == true)
	{
		vel_x = (vel_x >= MAX_VELOCITY) ? MAX_VELOCITY : vel_x + ACCELERATION_RATE;
	}
	else
	{
		vel_x *= 0.8; // decelerating
	}
	
	// Handle up/down movement
	
	if(keys[KEY_SPACE] == true && y+PLAYER_SIZE+vel_y >= FLOOR)
	{
		vel_y = JUMP_VELOCITY; 
	}
	else
	{
		vel_y = (vel_y > MAX_VELOCITY) ? MAX_VELOCITY : vel_y + GRAVITY_RATE;
	}
	
	// Floor collision
				
	if(y+PLAYER_SIZE+vel_y > FLOOR)
	{
		y = FLOOR-PLAYER_SIZE;
		vel_y = 0;
	}

	// Adjust player's velocity

	x += vel_x;
	y += vel_y;
}
	
function draw()
{									
	var d = new Date();
	var diff = d.getTime() - prevTime;
	prevTime = d.getTime();
			
	ctx.clearRect(0,0, canvas.width, canvas.height);
	
	ctx.fillStyle = "rgb(180,180,180)";
	
	var size = 32; // square size
	
	for(var i=0; i<canvas.width; i+=size)
	{
		for(var j=(i/size%2==0)?0:size; j<FLOOR; j+=size*2)
		{
			ctx.fillRect(i,j, size, size);
		}
	}
	
	ctx.fillStyle = "rgb(200,0,0)";
	ctx.fillRect(x, y, PLAYER_SIZE, PLAYER_SIZE);
	
	ctx.strokeStyle = "#000";

	ctx.beginPath();
	ctx.moveTo(0,FLOOR);
	ctx.lineTo(canvas.width, FLOOR);
	ctx.stroke();
		
	ctx.fillText(diff + ' ms', canvas.width - 50, 10);
}

// Key events

this.onkeydown = function(event)
{
	keys[event.keyCode] = true;
}
	
this.onkeyup = function(event)
{
	keys[event.keyCode] = false;
}