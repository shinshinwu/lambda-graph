var fs = require('fs')
var gm = require('gm').subClass({ imageMagick: true });

gm(200, 100, '#fff')
.drawText(10, 20, "hello world")
.drawRectangle(50,10,80,60)
.border(2, 2).borderColor('#ff0000')
.write('/Users/anna/Documents/webdev/eva-lambda/charts/test.png', function (err) {
  if (!err) console.log('done');
  if (err) console.log(err);
});
