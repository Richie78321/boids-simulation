var OBSTACLE_INTENSITY = 20;
var OBSTACLE_COLOR = [184, 38, 1];
var OBSTACLE_SIZE = 50;

class Obstacle
{
  constructor(position)
  {
    this.position = position;
  }

  getAvoidanceMagnitude(boid, processing)
  {
    //This sucks
    var boidCanvasPos = boid.getCanvasPosition(processing);
    var velocityVector = new PVector(MOVE_VEL * Math.cos(boid.heading), MOVE_VEL * Math.sin(boid.heading));
    var angleToBoid = Math.atan2(boidCanvasPos.y - this.position.y, boidCanvasPos.x - this.position.x);

    var avoidanceMagnitude = OBSTACLE_INTENSITY / Math.pow(getDistance(boidCanvasPos, this.position), 2);
    var avoidanceVector = new PVector(avoidanceMagnitude * Math.cos(angleToBoid), avoidanceMagnitude * Math.sin(angleToBoid));
    avoidanceVector.add(velocityVector);

    return Math.atan2(avoidanceVector.y, avoidanceVector.x) - Math.atan2(velocityVector.y, velocityVector.x);
  }

  draw(processing)
  {
    processing.stroke(OBSTACLE_COLOR[0], OBSTACLE_COLOR[1], OBSTACLE_COLOR[2]);
    processing.fill(OBSTACLE_COLOR[0], OBSTACLE_COLOR[1], OBSTACLE_COLOR[2]);
    processing.ellipse(this.position.x, this.position.y, OBSTACLE_SIZE / 2, OBSTACLE_SIZE / 2);
  }
}
