//Boid config
var BOID_WIDTH = 7.5;
var BOID_HEIGHT = 10;

//Creates boid body
function getBoidBody(position, heading)
{
  var bodyVerts = [];
  bodyVerts.push(new PVector(position.x - (BOID_HEIGHT / 2), position.y + (BOID_WIDTH / 2)));
  bodyVerts.push(new PVector(position.x - (BOID_HEIGHT / 2), position.y - (BOID_WIDTH / 2)));
  bodyVerts.push(new PVector(position.x + (BOID_HEIGHT / 2), position.y));
  for (let i = 0; i < bodyVerts.length; i++) bodyVerts[i] = rotatePoint(bodyVerts[i], position, heading);

  return bodyVerts;
}

//Constant declarations
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

    update(boids, obstacles, processing)
    {
      var relevantBoids = this.findRelevantBoids(boids, processing);

      //Random noise
      this.heading += ((Math.random() * 2 - 1) * HEADING_NOISE_WEIGHT);

      //Average heading
      var avgHeading = this.getAverageHeading(relevantBoids);
      this.heading += AVG_HEADING_WEIGHT * (avgHeading - this.heading);

      //Average position heading
      var avgPosHeading = this.getAveragePositionHeading(relevantBoids, processing);
      this.heading += AVG_POS_HEADING_WEIGHT * avgPosHeading;

      //Obstacle heading
      this.heading += this.getObstacleAvoidanceDelta(obstacles, processing);

      //Reach target color
      this.reachAverageColor(relevantBoids);

      //Move
      this.position.add(Math.cos(this.heading) * MOVE_VEL, Math.sin(this.heading) * MOVE_VEL);
    }

    //Finds the required change in heading to move towards the average position of surrouding birds
    getAveragePositionHeading(boids, processing)
    {
      if (boids.length > 0)
      {
        var avgPos = new PVector(0, 0);
        for (let i = 0; i < boids.length; i++) avgPos.add(boids[i].getCanvasPosition(processing));
        avgPos.div(boids.length);

        var canvasPos = this.getCanvasPosition(processing);
	      var averageVector = new PVector(avgPos.x - canvasPos.x, avgPos.y - canvasPos.y);
	      var headingVector = new PVector(Math.cos(this.heading), Math.sin(this.heading));

        var deltaHeading = Math.atan2(headingVector.x * averageVector.y - headingVector.y * averageVector.x, headingVector.x * averageVector.x + headingVector.y * averageVector.y);
        if (getDistance(avgPos, canvasPos) < TARGET_CROWDING_DIST)
        {
          if (deltaHeading < 0)
          {
            return Math.PI - Math.abs(deltaHeading);
          }
          else
          {
            return -(Math.PI - Math.abs(deltaHeading));
          }
        }
        else return deltaHeading;
      } else return 0;
    }

    //Finds the average heading of surrounding birds
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

    //Reaches the average color of the surrounding birds
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

    //Finds the birds within a distance away from the bird (not including self)
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

    //Gets the relative position of the bird on the screen (modulus division)
    getCanvasPosition(processing)
    {
      var pos = new PVector(this.position.x % processing.width, this.position.y % processing.height);
      if (pos.x < 0) pos.set(processing.width + pos.x, pos.y);
      if (pos.y < 0) pos.set(pos.x, processing.height + pos.y);
      return pos;
    }

    //Finds the headings required to avoid obstacles
    getObstacleAvoidanceDelta(obstacles, processing)
    {
      var headingDelta = 0;
      for (let i = 0; i < obstacles.length; i++)
      {
        headingDelta += obstacles[i].getAvoidanceMagnitude(this, processing);
      }

      return headingDelta;
    }

    //Draws the bird
    draw(processing)
    {
      var canvasPosition = this.getCanvasPosition(processing);

      if (SHOW_RELEVANCE_ELLIPSE)
      {
        processing.stroke(255, 255, 255);
        processing.fill(0, 0, 0, 0);
        processing.ellipse(canvasPosition.x, canvasPosition.y, DIST_RELEVANCE, DIST_RELEVANCE);
      }

      processing.stroke(this.color[0], this.color[1], this.color[2]);
      processing.fill(this.color[0], this.color[1], this.color[2])

      var bodyVerts = getBoidBody(canvasPosition, this.heading);
      processing.triangle(bodyVerts[0].x, bodyVerts[0].y, bodyVerts[1].x, bodyVerts[1].y, bodyVerts[2].x, bodyVerts[2].y);
    }
}
