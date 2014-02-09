
void setup()
{
  size(64,64);
  ellipseMode(RADIUS);
  strokeJoin(ROUND);
}

void draw()
{
  background(255, 255, 255, 0);
  stroke(0);
  noFill();
  strokeWeight(0.05 * width);

  float yPelv = 0.65;
  float yArms = 0.50;

  ellipse(0.50 * width,  0.25 * height, 0.10 * width,  0.10 * height);  // head
  line(   0.50 * width,  0.35 * height, 0.50 * width, yPelv * height);  // body
  line(   0.40 * width,  0.90 * height, 0.50 * width, yPelv * height);  // left leg
  line(   0.60 * width,  0.90 * height, 0.50 * width, yPelv * height);  // right leg
  line(   0.40 * width, yArms * height, 0.60 * width, yArms * height);  // arms
}


