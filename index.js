var gm = require('gm').subClass({ imageMagick: true });
var fs = require('fs')
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const axios = require('axios');

// gm("img.png").drawRectangle(x0, y0, x1, y1 [, wc, hc])
// .drawText(10, 20, "hello world")

// @datasets = [
//   [:Jimmy, [25, 36, 86, 39]],
//   [:Charles, [80, 54, 67, 54]],
//   [:Julie, [22, 29, 35, 38]],
//   ]

// exports.handler = function(event, context, callback) {

  // let _callback = callback;

  const url = "https://dailygieselmann.com/time-series/eva%3Aoptinmonster.com?raw"

  // axios.get(url)
  // .then(response => {
  //   let data = []
  //   response.data.split('\n').forEach((v) => {
  //     let utcSeconds = parseInt(v.split(',')[0])*1000 // convert into miliseconds
  //     let twoYearsAgo = new Date().setFullYear(new Date().getFullYear() - 2)
  //     if (utcSeconds > twoYearsAgo) {
  //       data.push(parseInt(v.split(',')[1]))
  //     }
  //   })
  // })
  // .catch(error => {
  //   console.log(error);
  // });

  // var data = [
  //   {points: [25, 36, 86, 39], color: '#49669f'},
  //   {points: [80, 54, 67, 54], color: '#f3ddcf'},
  //   {points: [22, 29, 35, 38], color: '#992f2f'}
  // ]

  // TODO: need to parse the data to below format and think about how to distribute the width and height pixels

  colors = ['#49669f', '#f3ddcf', '#992f2f']

  let data = [
    [10, 20, 17],
    [20, 15, 15]
  ]

  // (10,100,50,90)
  // (10,90,50,70)
  // (10,70,50,53)
  // (50,100,90,80)
  // (50,80,90,65)
  // (50,65,90,50)

  let output = []

  let width = 900
  let height = 300
  let chart = gm(width, height, 'transparent')

  let xInitialStart = 10
  let xIncrement = 40

  data.forEach((v, index) => {
    let xStart = xInitialStart + xIncrement * index
    let xEnd = xInitialStart + xIncrement * (index + 1)
    let yStart = height

    v.forEach((point, colorIndex) => {
      let yEnd = yStart - point
      chart.fill(colors[colorIndex]);
      chart.drawRectangle(xStart, yStart, xEnd, yEnd)
      // output.push({coors: [xStart, yStart, xEnd, yEnd], color: colors[colorIndex]})
      yStart = yEnd
    })

    // chart.fill(v.color);
    // let yStart = height
    // v.points.forEach((point, index) => {
    //   let xEnd = xStart + xIncrement * index
    //   let yEnd = yStart - point
    //   chart.drawRectangle(xStart,yStart,xEnd,yEnd)
    // })
  })


  // chart.fill('#49669f')
  // chart.drawRectangle(10,100,50,90)
  // .drawRectangle(50,100,90,80)

  // chart.fill('#f3ddcf')
  // .drawRectangle(10,90,50,70)
  // .drawRectangle(50,80,90,65)

  // chart.fill('#992f2f')
  // .drawRectangle(10,70,50,53)
  // .drawRectangle(50,65,90,50)

  chart.write('/Users/anna/Documents/webdev/eva-lambda/charts/test.png', function (err) {
    if (!err) console.log('done');
    if (err) console.log(err);
  });

// };

  // .toBuffer('png', function(err, buffer) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     s3.putObject({
  //       Bucket: 'eva-lambda-output',
  //       Key: 'images/another-test.png',
  //       ContentType: 'image/png',
  //       Body: buffer
  //     }, function(err, data) {
  //       if (err) {
  //         return console.log(err)
  //       }
  //       console.log('successfully uploaded to s3', data)

  //       let response = {
  //         statusCode: 200,
  //         headers: {"Content-Type": "application/json"},
  //         body: JSON.stringify({"success": true})
  //       }

  //       _callback(null, response)

  //     })
  //   }
  // });
