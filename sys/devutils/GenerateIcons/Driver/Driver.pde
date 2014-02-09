
void setup()
{
  size(64,64);
  ellipseMode(RADIUS);
  strokeJoin(BEVEL);
}

PVector cl(float oClock, float nDist)
{
  float angle = PI * oClock / 6.0;
  angle -= HALF_PI;
  return new PVector(nDist * cos(angle), nDist * sin(angle));
}

float prevX;
float prevY;

void vertex_pv(PVector pv)
{
  vertex(pv.x, pv.y);

  prevX = pv.x;
  prevY = pv.y;
}

void quadraticVertex_pv(PVector pvControl, PVector pvEnd)
{
  float cp1x = prevX + 2.0/3.0*(pvControl.x - prevX);
  float cp1y = prevY + 2.0/3.0*(pvControl.y - prevY);
  float cp2x = cp1x + (pvEnd.x - prevX)/3.0;
  float cp2y = cp1y + (pvEnd.y - prevY)/3.0;
   
  bezierVertex(cp1x, cp1y, cp2x, cp2y, pvEnd.x, pvEnd.y);

  prevX = pvEnd.x;
  prevY = pvEnd.y;
}

void draw()
{
  background(255, 255, 255, 0);
  translate(width/2, height/2);
  float nRadius = 0.40 * width;
  
  stroke(0);
  noFill();
  strokeWeight(0.10 * width);
  ellipse(0, 0, nRadius, nRadius);

  nRadius *= 0.96;

  strokeWeight(0.09 * width);
  fill(0);
  beginShape();
  vertex_pv(cl(8.5, nRadius));
  quadraticVertex_pv(cl(12.0, 0.5 * nRadius), cl(3.5, nRadius));
  quadraticVertex_pv(cl(4.0,  0.0 * nRadius), cl(5.0, nRadius));
  quadraticVertex_pv(cl(6.0,  0.2 * nRadius), cl(7.0, nRadius));
  quadraticVertex_pv(cl(8.0,  0.0 * nRadius), cl(8.5, nRadius));
  endShape();
}


