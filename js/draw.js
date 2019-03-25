var CANVAS_PADDING = 5;
var BACKGROUND_COLOR = [0, 0, 0];

//Boid config
var BOID_WIDTH = 7.5;
var BOID_HEIGHT = 10;

function initCanvas()
{
  var canvas = document.getElementById('draw-canvas');
  var processing = new Processing(canvas, initProcessing);
  processing.size(window.innerWidth - CANVAS_PADDING, window.innerHeight - CANVAS_PADDING);
}

function initProcessing(processing)
{
  var boids = [];
  processing.setup = function()
  {
    $(window).resize(() => {
      processing.size(window.innerWidth - CANVAS_PADDING, window.innerHeight - CANVAS_PADDING);
    });
    processing.background(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2]);
  }

  processing.draw = function()
  {
    processing.background(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2]);
    processing.stroke(255, 255, 255);
    processing.fill(255, 255, 255);

    //Update boids
    for (let i = 0; i < boids.length; i++)
    {
      boids[i].update(boids, processing);
    }

    //Draw boids
    for (let i = 0; i < boids.length; i++)
    {
      boids[i].draw(processing);
    }
  }

  processing.mouseClicked = function()
  {
    console.log(processing.mouseX + ", " + processing.mouseY);
    boids.push(new Boid(new PVector(processing.mouseX, processing.mouseY), Math.random() * Math.PI * 2, [Math.random() * 255, Math.random() * 255, Math.random() * 255]));
  }
}

function getBoidBody(position, heading)
{
  var bodyVerts = [];
  bodyVerts.push(new PVector(position.x - (BOID_HEIGHT / 2), position.y + (BOID_WIDTH / 2)));
  bodyVerts.push(new PVector(position.x - (BOID_HEIGHT / 2), position.y - (BOID_WIDTH / 2)));
  bodyVerts.push(new PVector(position.x + (BOID_HEIGHT / 2), position.y));
  for (let i = 0; i < bodyVerts.length; i++) bodyVerts[i] = rotatePoint(bodyVerts[i], position, heading);

  return bodyVerts;
}

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

//Add angle relevance
var DIST_RELEVANCE = 50;
var MOVE_VEL = 1;
var AVG_HEADING_WEIGHT = .075;
var HEADING_NOISE_WEIGHT = .05;
var SHOW_RELEVANCE_ELLIPSE = false;
var AVG_POS_HEADING_WEIGHT = .01;
var TARGET_CROWDING_DIST = 25;
var COLOR_DETLA_VEL = .1;
class Boid {
    constructor(startPosition, startHeading, color)
    {
        this.position = startPosition;
        this.heading = startHeading;
        this.color = color;
        this.defaultColor = [color[0], color[1], color[2]];
    }

    update(boids, processing)
    {
      var relevantBoids = this.findRelevantBoids(boids, processing);

      //Random noise
      this.heading += ((Math.random() * 2 - 1) * HEADING_NOISE_WEIGHT);

      //Average heading
      var avgHeading = this.getAverageHeading(relevantBoids);
      this.heading += AVG_HEADING_WEIGHT * (avgHeading - this.heading);

      //Average position heading
      var avgPosHeading = this.getAveragePositionHeading(relevantBoids, processing);
      this.heading += AVG_POS_HEADING_WEIGHT * (avgPosHeading - this.heading);

      //Reach target color
      this.reachAverageColor(relevantBoids);

      //Move
      this.position.add(Math.cos(this.heading) * MOVE_VEL, Math.sin(this.heading) * MOVE_VEL);
    }

    getAveragePositionHeading(boids, processing)
    {
      if (boids.length > 0)
      {
        var avgPos = new PVector(0, 0);
        for (let i = 0; i < boids.length; i++) avgPos.add(boids[i].getCanvasPosition(processing));
        avgPos.div(boids.length);

        var canvasPos = this.getCanvasPosition(processing);
        var targetHeading = Math.atan2(avgPos.y - canvasPos.y, avgPos.x - canvasPos.x);
        if (getDistance(avgPos, canvasPos) < TARGET_CROWDING_DIST) return (targetHeading + Math.PI) % (Math.PI * 2);
        else return targetHeading;
      } else return this.heading;
    }

    getAverageHeading(boids)
    {
      if (boids.length > 0)
      {
        var avgHeading = 0;
        for (let i = 0; i < boids.length; i++) avgHeading += boids[i].heading;
        return avgHeading / boids.length;
      }
      else return this.heading;
    }

    reachAverageColor(boids)
    {
      if (boids.length > 0)
      {
        var targetColor = [0, 0, 0];
        for (let i = 0; i < boids.length; i++) for (let j = 0; j < targetColor.length; j++) targetColor[j] += boids[i].color[j];
        for (let i = 0; i < targetColor.length; i++) targetColor[i] /= boids.length;
      }
      else var targetColor = this.defaultColor;

      for (let i = 0; i < targetColor.length; i++) this.color[i] += COLOR_DETLA_VEL * (targetColor[i] - this.color[i]);
    }

    findRelevantBoids(boids, processing)
    {
      var canvasPos = this.getCanvasPosition(processing);
      var relevantBoids = [];
      for (let i = 0; i < boids.length; i++)
      {
        var otherCanvasPos = boids[i].getCanvasPosition(processing);
        if (boids[i] != this && getDistance(canvasPos, otherCanvasPos) <= DIST_RELEVANCE)
        {
          relevantBoids.push(boids[i]);
        }
      }

      return relevantBoids;
    }

    getCanvasPosition(processing)
    {
      var pos = new PVector(this.position.x % processing.width, this.position.y % processing.height);
      if (pos.x < 0) pos.set(processing.width + pos.x, pos.y);
      if (pos.y < 0) pos.set(pos.x, processing.height + pos.y);
      return pos;
    }

    draw(processing)
    {
      var canvasPosition = this.getCanvasPosition(processing);

      if (SHOW_RELEVANCE_ELLIPSE)
      {
        processing.stroke(0, 0, 255);
        processing.fill(0, 0, 255);
        processing.ellipse(canvasPosition.x, canvasPosition.y, DIST_RELEVANCE, DIST_RELEVANCE);
      }

      processing.stroke(this.color[0], this.color[1], this.color[2]);
      processing.fill(this.color[0], this.color[1], this.color[2])

      var bodyVerts = getBoidBody(canvasPosition, this.heading);
      processing.triangle(bodyVerts[0].x, bodyVerts[0].y, bodyVerts[1].x, bodyVerts[1].y, bodyVerts[2].x, bodyVerts[2].y);
    }
}
