
void setup()
{
  size(60,60);
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

void bezierVertex_pv(PVector pvC1, PVector pvC2, PVector pvEnd)
{
  bezierVertex(pvC1.x, pvC1.y, pvC2.x, pvC2.y, pvEnd.x, pvEnd.y);
}

void draw()
{
  background(255, 255, 255, 0);
  float nRadius = 0.28 * width;

  translate(0.5 * width, 0.35 * height);
  locationMarker("B", nRadius);
  
  noLoop();
}

void locationMarker(String sText, float nRadius)
{
  stroke(0,0,255);
  strokeWeight(1);
  fill(0,255,0);
  
  float nCtrlRadius = nRadius * 1.3;
  
  beginShape();
  vertex_pv(cl(9.0, nRadius));
  quadraticVertex_pv(cl(10.5, nCtrlRadius), cl(12.0, nRadius));
  quadraticVertex_pv(cl( 1.5, nCtrlRadius), cl( 3.0, nRadius));

  bezierVertex_pv(cl(4.5,   nCtrlRadius), cl( 4.5, 0.3 * nRadius), cl( 6.0, nRadius * 2.0));
  bezierVertex_pv(cl(7.5, 0.3 * nRadius), cl( 7.5,   nCtrlRadius), cl( 9.0, nRadius));

  endShape();
  
  float nTextSize = 1.0 * nRadius;
  textFont(createFont("Arial bold", nTextSize));
  float nTextWidth = textWidth(sText);
  
  fill(0);
  text(sText, -0.5 * nTextWidth, 0.4 * nTextSize);
}


