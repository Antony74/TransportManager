
void setup()
{
  size(64,64);
}

void draw()
{
  background(255, 255, 255, 0);
  stroke(0,0,255);
  strokeWeight(1);
  fill(255, 255, 150);
  smooth();

  float s = 10 * 0.7;
  float m = 15 * 0.7;
  float l = 20 * 0.7;

  // Define the four corners of our report
  PVector c1 = new PVector(        s,          m);
  PVector c2 = new PVector(width - l,          s);
  PVector c3 = new PVector(width - s, height - l);
  PVector c4 = new PVector(        l, height - s);

  float a = 10;

  // Draw them with a wavy edge
  beginShape();
  vertex_pv(c1);
  bezierVertex_pv(pv_add(c1,  a,  a), pv_add(c2, -a, -a), c2);
  bezierVertex_pv(pv_add(c2, -a,  a), pv_add(c3,  a, -a), c3);
  bezierVertex_pv(pv_add(c3, -a, -a), pv_add(c4,  a,  a), c4);
  bezierVertex_pv(pv_add(c4,  a, -a), pv_add(c1, -a,  a), c1);
  endShape(CLOSE);
  
  stroke(0);
  noFill();
  
  c1 = pv_add(c1,  10, 10);
  c2 = pv_add(c2, -10, 10);

  float b = 5;

  // Draw a line of text on the report
  bezier_pv(c1, pv_add(c1,  b,  b), pv_add(c2, -b, -b), c2);
  
  c1 = pv_add(c1, 2, 5);
  c2 = pv_add(c2, 2, 5);

  // Draw a line of text on the report
  bezier_pv(c1, pv_add(c1,  b,  b), pv_add(c2, -b, -b), c2);

  c1 = pv_add(c1, 2, 5);
  c2 = pv_add(c2, 2, 5);

  // Draw a line of text on the report
  bezier_pv(c1, pv_add(c1,  b,  b), pv_add(c2, -b, -b), c2);
  
  // Draw a tick on the report
  stroke(0, 128, 0);
  strokeWeight(3);

  beginShape();
  vertex(29, 40);
  vertex(33, 43);
  vertex(42, 33);
  endShape();
}

PVector pv_add(PVector pv, float x, float y)
{
  return new PVector(pv.x + x, pv.y + y);
}

void vertex_pv(PVector pv)
{
  vertex(pv.x, pv.y);
}

void bezierVertex_pv(PVector cp1, PVector cp2, PVector pv)
{
  bezierVertex(cp1.x, cp1.y, cp2.x, cp2.y, pv.x, pv.y);
}

void bezier_pv(PVector pv1, PVector cp1, PVector cp2, PVector pv2)
{
  bezier(pv1.x, pv1.y, cp1.x, cp1.y, cp2.x, cp2.y, pv2.x, pv2.y);
}


