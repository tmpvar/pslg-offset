var fc = require('fc')
var center = require('ctx-translate-center')
var circle = require('ctx-circle')

// var pslgOffset = require('../pslg-offset')

var poly = {
  points: [
    [-100,  100],
    [ 100,  100],
    [ 100,  50],
    [-100, -100]
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0]
  ]
}


var ctx = fc(function() {
  ctx.clear()
  center(ctx)

  ctx.strokeStyle = "red"

  drawPoly(ctx, poly.edges, poly.points)


  var offset = pslgOffset(poly.edges, poly.points, 10, ctx)
  drawPoly(ctx, poly.edges, poly.points)
})

function drawPoly(ctx, edges, points, stroke, fill) {
  ctx.fillStyle = fill || "#888"
  ctx.strokeStyle = stroke || "#888"
  ctx.beginPath()
    edges.forEach(function(edge) {
      var start = points[edge[0]]
      var end = points[edge[1]]
      ctx.moveTo(start[0], start[1])
      ctx.lineTo(end[0], end[1])
      circle(ctx, end[0], end[1], 2)
    })
    ctx.fill()
    ctx.stroke()

}

var min = Math.min
var max = Math.max

function pslgOffset(edges, points, radius, ctx) {
  // build out 2d intervals (aabb)
  var aabbs = edges.map(function(edge) {
    var start = points[edge[0]]
    var end = points[edge[1]]

    var aabb = [
      min(start[0], end[0]) - radius,
      min(start[1], end[1]) - radius,
      max(start[0], end[0]) + radius,
      max(start[1], end[1]) + radius
    ]

    ctx.strokeStyle = 'red'
    ctx.strokeRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1])

    return aabb
  })




}
