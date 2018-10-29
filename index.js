var gm = require('gm').subClass({ imageMagick: true });
var fs = require('fs')
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const axios = require('axios');

// gm("img.png").drawRectangle(x0, y0, x1, y1 [, wc, hc])
// .drawText(10, 20, "hello world")


// exports.handler = function(event, context, callback) {

  // let _callback = callback;

  const url = "https://dailygieselmann.com/time-series/eva%3Aoptinmonster.com?raw"

  const evaRankColors = [
    {start: 4500000, end: 3000000, color: '#344b75', divider: 150, order: 10},
    {start: 3000000, end: 2000000, color: '#4966A0', divider: 100, order: 9},
    {start: 2000000, end: 1000000, color: '#638ABB', divider: 100, order: 8},
    {start: 1000000, end: 500000,  color: '#92C7E3', divider: 50,  order: 7},
    {start: 500000,  end: 200000,  color: '#D0F2FB', divider: 30,  order: 6},
    {start: 200000,  end: 100000,  color: '#F3DDCF', divider: 10,  order: 5},
    {start: 100000,  end: 50000,   color: '#D99C7F', divider: 5,   order: 4},
    {start: 50000,   end: 25000,   color: '#BC614C', divider: 2.5, order: 3},
    {start: 25000,   end: 10000,   color: '#992F2F', divider: 1.5, order: 2},
    {start: 10000,   end: 1,       color: '#60151F', divider: 1,   order: 1}
  ];

  axios.get(url)
  .then(response => {
    let data = []

    response.data.split('\n').forEach((v) => {
      let utcSeconds = parseInt(v.split(',')[0])*1000 // convert into miliseconds
      let twoYearsAgo = new Date().setFullYear(new Date().getFullYear() - 2)
      if (utcSeconds > twoYearsAgo) {
        data.push(parseInt(v.split(',')[1]))
      }
    })

    // TODO: Need to test this with single band charts
    // TODO: make good comments for the code and include in the eva code base

    // let data = [
    //   [10, 20, 17],
    //   [20, 15, 15]
    // ]

    // (10,100,50,90)
    // (10,90,50,70)
    // (10,70,50,53)
    // (50,100,90,80)
    // (50,80,90,65)
    // (50,65,90,50)

    let trafficMax = Math.max(...data) // largest number for traffic, lowest ranking
    let trafficMin = Math.min(...data) // lowest number for traffic, highest ranking

    let startBand = evaRankColors.find((v) => {
      if ((v.start >= trafficMax) && (v.end < trafficMax)) {
        return true
      }
    })

    let endBand = evaRankColors.find((v) => {
      if ((v.start >= trafficMin) && (v.end < trafficMin)) {
        return true
      }
    })

    let output = []

    let padding = 10 // leave 10 padding on all sides except for bottom
    let xIncrement = 50

    let formattedData = []
    let bands = []
    let orderedColors = []

    evaRankColors.forEach((v) => {
      if ((v.order <= startBand.order) && (v.order >= endBand.order)) {
        bands.push(v)
      }
    })

    bands.forEach(band => {
      orderedColors.push(band.color)
      formattedData.push({bandOrder: band.order, chartData:[]})
    })

    console.log('colors are ', orderedColors)

    data.forEach((point, trafficIndex) => {
      bands.forEach((band, bandIndex) => {
        // if the current ranking is less (higher) than the band start, fill the color, otherwise the ranking does not fill this current band
        let dataBand = formattedData.find(d => d.bandOrder == band.order)

        if (point <= band.start) {
          let bandDiff = band.start - point
          let bandSize = band.start - band.end

          // if the ranking ends in this band, only fill the diff, otherwise fill the entire band
          if (bandDiff <= bandSize) {
            dataBand.chartData.push(bandDiff / band.divider)
          } else {
            dataBand.chartData.push(bandSize / band.divider)
          }
        } else {
          dataBand.chartData.push(0)
        }
      })
    })

    // transpose array
    let transposedData = []

    formattedData.forEach(e => transposedData.push(e.chartData))

    transposedData = transposedData[0].map((col, i) => transposedData.map(row => row[i]));

    console.log('transposed array is ', transposedData)

    let width = transposedData.length * xIncrement + padding * 2
    // height equals the max value of the highet bar (highest sum of transposed array)
    let height = Math.max(...transposedData.map(a => {return a.reduce((sum, v) => sum+v)})) + padding

    console.log('chart width and height are ', width, height)

    let chart = gm(width, height, 'transparent')

    transposedData.forEach((v, index) => {
      let xStart = padding + xIncrement * index
      let xEnd = padding + xIncrement * (index + 1)
      let yStart = height

      v.forEach((point, colorIndex) => {
        let yEnd = yStart - point
        chart.fill(orderedColors[colorIndex]);
        chart.drawRectangle(xStart, yStart, xEnd, yEnd)
        output.push({coors: [xStart, yStart, xEnd, yEnd], color: orderedColors[colorIndex]})
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

    console.log(output)


    // chart.fill('#49669f')
    // chart.drawRectangle(10,100,50,90)
    // .drawRectangle(50,100,90,80)

    // chart.fill('#f3ddcf')
    // .drawRectangle(10,90,50,70)
    // .drawRectangle(50,80,90,65)

    // chart.fill('#992f2f')
    // .drawRectangle(10,70,50,53)
    // .drawRectangle(50,65,90,50)

    // resize the image and force to change the aspect ratio (https://aheckmann.github.io/gm/docs.html#drawing-primitives)
    chart.resize(900, 300, "!")
      .write('/Users/anna/Documents/webdev/eva-lambda/charts/test.png', function (err) {
      if (!err) console.log('done');
      if (err) console.log(err);
    });


  })
  .catch(error => {
    console.log(error);
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
