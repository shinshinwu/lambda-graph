var fs = require('fs')
var gm = require('gm').subClass({ imageMagick: true });

// gm("img.png").drawRectangle(x0, y0, x1, y1 [, wc, hc])
// .drawText(10, 20, "hello world")

// @datasets = [
//   [:Jimmy, [25, 36, 86, 39]],
//   [:Charles, [80, 54, 67, 54]],
//   [:Julie, [22, 29, 35, 38]],
//   ]

gm(200, 100, 'transparent')
.fill('#49669f')
.drawRectangle(10,100,50,90)
.drawRectangle(50,100,90,80)
.fill('#f3ddcf')
.drawRectangle(10,90,50,70)
.drawRectangle(50,80,90,65)
.fill('#992f2f')
.drawRectangle(10,70,50,53)
.drawRectangle(50,65,90,50)
.write('/Users/anna/Documents/webdev/eva-lambda/charts/test.png', function (err) {
  if (!err) console.log('done');
  if (err) console.log(err);
});
