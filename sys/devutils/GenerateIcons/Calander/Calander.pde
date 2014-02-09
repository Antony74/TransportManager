
void setup()
{
  size(64,64);
  ellipseMode(RADIUS);
}

void draw()
{
  background(255, 255, 255, 0);
  rectMode(CORNERS);
  noStroke();

  float radius = 0.1 * height;
  float xStart = height * 0.15;
  float xEnd = height * 0.85;
  float yStart = height * 0.15;
  float yHeaderEnd = height * 0.25;
  float yEnd = height * 0.85;
  
  fill(255,0,0);
  ellipse(xStart, yStart, radius, radius);
  ellipse(yEnd,   xStart, radius, radius);
  rect(xStart, yStart - radius, xEnd, yHeaderEnd);
  rect(xStart - radius, yStart, xEnd + radius, yHeaderEnd);
  
  fill(240);
  ellipse(xStart, yEnd, radius, radius);
  ellipse(yEnd,   xEnd, radius, radius);
  rect(xStart, yHeaderEnd, xEnd, yEnd + radius);
  rect(xStart - radius, yHeaderEnd, xEnd + radius, yEnd);

  rectMode(CORNER);
  translate(xStart, yHeaderEnd + radius);
  
  float nSquare = 0.08 * width;
  float nSpace  = 0.10 * width;
  
  fill(220);
  for (int nWeek = 0; nWeek < 5; ++nWeek)
  {
    for (int nDay = 0; nDay < 7; ++nDay)
    {
      if (nWeek > 0 || nDay > 2)
      {
        if (nWeek < 4 || nDay < 5)
        {
          rect(nSpace * nDay, nSpace * nWeek, nSquare, nSquare);
        }
      }
    }
  }
}



