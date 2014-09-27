if (typeof phantom == 'undefined')
{
    var usage = '\r\n'
    usage +=    'Usage: phantomjs GenerateIcons.js\r\n\r\n';
    usage +=    'Sorry, are you trying to use a different JavaScript engine?\r\n\r\n';
    usage +=    'Note you can install PhantomJS with npm:\r\n';
    usage +=    'npm install -g phantomjs\r\n';

    if      (typeof alert   != 'undefined') (function(){alert(usage);       })();
    else if (typeof console != 'undefined') (function(){console.log(usage); })();
    else if (typeof WScript != 'undefined') (function(){WScript.echo(usage);})();
}
else (function()
{
    var fs = require('fs');
    var iconDir = "GenerateIcons/"
    myList = fs.list(iconDir);

    var arrIcons = [];
    var sHtml = '<html><head><title>Icons for Transport Manager</title>\n'
    sHtml    += '<script src="' + iconDir + 'processing.js"></script><body>\n';

    for(var n in myList)
    {
        var dirItem = myList[n];
        var dirItemPath = iconDir + dirItem;
        if (fs.isDirectory(dirItemPath)
        &&  dirItem != '.'
        &&  dirItem != '..'
        &&  dirItem != "libraries" // These folders can appear due to a quirk of the Processing IDE
        &&  dirItem != "modes"
        &&  dirItem != "tools")
        {
            arrIcons.push(dirItem);
            
            sHtml += '<canvas id="' + dirItem + '" data-processing-sources="' + dirItemPath + '/' + dirItem + '.pde"></canvas>\n';
        }
    }

    sHtml += '</body></html>\n';

    fs.write('icons.html', sHtml, 'w');

    var page = require('webpage').create();

    page.zoomFactor = 1.0;

    page.open('icons.html', function()
    {
        // Inject a function into the webpage that returns the bounding box of each canvas element
        var rects = page.evaluate(function(arrIcons)
        {
          var rects = {};

          for (var n in arrIcons)
          {
            sIcon = arrIcons[n];
            rects[sIcon] = document.getElementById(sIcon).getBoundingClientRect();
          }

          return rects;
        }, arrIcons);

      for(var id in rects)
      {
          // Use the canvas's bounding box to render an png of just the canvas
          var rect = rects[id];
          page.clipRect =
          {
            left:   rect.left   * page.zoomFactor,
            top:    rect.top    * page.zoomFactor,
            width:  rect.width  * page.zoomFactor,
            height: rect.height * page.zoomFactor
          };

          page.render('../htdocs/icons/' + id + '.png');
          page.render('../htdocs/icons/' + id + '.ico');
      }
      
      phantom.exit();
      
    });

})();

