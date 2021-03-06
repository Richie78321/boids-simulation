var CANVAS_PADDING = 5;
var BACKGROUND_COLOR = [0, 0, 0];
var START_NUM = 50;

var IS_INIT = false;
function initCanvas()
{
  //Initializes the canvas
  if (!IS_INIT)
  {
    var canvas = document.getElementById('draw-canvas');
    var processing = new Processing(canvas, initProcessing);
    processing.size(window.innerWidth - CANVAS_PADDING, window.innerHeight - CANVAS_PADDING);
    IS_INIT = true;
  }
}

function initProcessing(processing)
{
  //Initializes the processing window
  var boids = [];
  var obstacles = [];
  processing.setup = function()
  {
    //Resets canvas size when the window is resized
    $(window).resize(() => {
      processing.size(window.innerWidth - CANVAS_PADDING, window.innerHeight - CANVAS_PADDING);
    });
    processing.background(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2]);

    //Spawns initial set of birds
    for (let i = 0; i < START_NUM; i++)
    {
      boids.push(new Boid(new PVector(Math.random() * (window.innerWidth - CANVAS_PADDING), Math.random() * (window.innerHeight - CANVAS_PADDING)), Math.random() * Math.PI * 2, [Math.random() * 255, Math.random() * 255, Math.random() * 255]));
    }
  }

  //Defines the drawing loop
  processing.draw = function()
  {
    processing.background(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2]);
    processing.stroke(255, 255, 255);
    processing.fill(255, 255, 255);

    //Update boids
    for (let i = 0; i < boids.length; i++)
    {
      boids[i].update(boids, obstacles, processing);
    }

    //Draw obstacles
    for (let i = 0; i < obstacles.length; i++)
    {
      obstacles[i].draw(processing);
    }

    //Draw boids
    for (let i = 0; i < boids.length; i++)
    {
      boids[i].draw(processing);
    }
  }

  //Defines what happens when the canvas is clicked by the mouse
  processing.mouseClicked = function()
  {
    if (processing.mouseButton == processing.LEFT)
    {
      //Adds a new bird
      boids.push(new Boid(new PVector(processing.mouseX, processing.mouseY), Math.random() * Math.PI * 2, [Math.random() * 255, Math.random() * 255, Math.random() * 255]));
    }
    else
    {
      //Adds an obstacle
      obstacles.push(new Obstacle(new PVector(processing.mouseX, processing.mouseY)));
    }
  }
}

//Rotates a point around a defined axis
function rotatePoint(point, axis, rotation)
{
  var relPoint = new PVector(point.x, point.y);
  relPoint.sub(axis);

  var newPoint = new PVector(relPoint.x * Math.cos(rotation) - relPoint.y * Math.sin(rotation), relPoint.x * Math.sin(rotation) + relPoint.y * Math.cos(rotation));
  newPoint.add(axis);
  return newPoint;
}

function getDistance(point1, point2)
{
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}
