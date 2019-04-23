var OBSTACLE_INTENSITY = 20;
var OBSTACLE_COLOR = [184, 38, 1];
var OBSTACLE_SIZE = 50;

class Obstacle
{
  constructor(position)
  {
    this.position = position;
  }

  //Gets the magnitude for a bird's avoidance steering
  getAvoidanceMagnitude(boid, processing)
  {
    var canvasPosition = boid.getCanvasPosition(processing);
    var velocityVector = new PVector(Math.cos(boid.heading), Math.sin(boid.heading));
    var obstacleVector = new PVector(this.position.x - canvasPosition.x, this.position.y - canvasPosition.y);
    var angleBetween = Math.atan2(obstacleVector.x * velocityVector.y - obstacleVector.y * velocityVector.x, obstacleVector.x * velocityVector.x + obstacleVector.y * velocityVector.y);

    var avoidanceMagnitude = OBSTACLE_INTENSITY / Math.pow(getDistance(canvasPosition, this.position), 2);
    if (angleBetween >= 0) return avoidanceMagnitude;
    else return -avoidanceMagnitude;
  }

  //Draws the obstacle (a circle)
  draw(processing)
  {
    processing.stroke(OBSTACLE_COLOR[0], OBSTACLE_COLOR[1], OBSTACLE_COLOR[2]);
    processing.fill(OBSTACLE_COLOR[0], OBSTACLE_COLOR[1], OBSTACLE_COLOR[2]);
    processing.ellipse(this.position.x, this.position.y, OBSTACLE_SIZE / 2, OBSTACLE_SIZE / 2);
  }
}
