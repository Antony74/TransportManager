
void setup()
{
  size(64,64);
  ellipseMode(RADIUS);
  strokeJoin(BEVEL);
}

void draw()
{
  background(255, 255, 255, 0);
  stroke(0);
  fill(0,0,255);
  strokeWeight(0.03 * width);

  float yRoof = 0.2 * height;
  float yBonnet = 0.5 * height;
  float yClearance = 0.8 * height;
  float xBack = 0.1 * width;
  float xBackWindRoof = 0.2 * width;
  float xFrontWindRoof = 0.5 * width;
  float xFrontWindBonnet = 0.7 * width;
  float xFront = 0.9 * width;
  float wheelSize = 0.1 * width;

  beginShape();
  curveVertex(xBack, yClearance);
  curveVertex(xFront, yClearance);
  curveVertex(xFront, yBonnet);
  curveVertex(xFrontWindBonnet, yBonnet);
  curveVertex(xFrontWindRoof, yRoof);
  curveVertex(xBackWindRoof, yRoof);
  curveVertex(xBack, yBonnet);
  curveVertex(xBack, yClearance);
  curveVertex(xFront, yClearance);
  curveVertex(xFront, yBonnet);
  endShape();
  
  fill(0);
  ellipse((xBack * 0.8) + (xFront * 0.2), yClearance, wheelSize, wheelSize);
  ellipse((xBack * 0.2) + (xFront * 0.8), yClearance, wheelSize, wheelSize);
}


