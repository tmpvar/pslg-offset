var fc = require('fc')
var center = require('ctx-translate-center')
var circle = require('ctx-circle')

// var pslgOffset = require('../pslg-offset')

var poly = {
  points: [
    [-100,  100],
    [ 100,  100],
    [ 100,  50],
    [-100, -100],
    [50, 50],
    [150, 0],
    [0, -150]
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    [4, 5],
    [5, 6],
    [6, 4]
  ]
}


var ctx = fc(function() {
  ctx.clear()
  center(ctx)
  ctx.scale(2, 2)
  ctx.strokeStyle = "red"

  var offset = pslgOffset(poly.edges, poly.points, 10, ctx)

  // drawPoly(ctx, offset.edges, offset.points)

  drawPoly(ctx, poly.edges, poly.points)
})

function drawPoly(ctx, edges, points, stroke, fill) {
  ctx.fillStyle = fill || 'hsl(220, 100%, 55%)'
  ctx.strokeStyle = stroke || 'hsl(220, 100%, 55%)'
  ctx.beginPath()
    edges.forEach(function(edge) {
      var start = points[edge[0]]
      var end = points[edge[1]]
      ctx.moveTo(start[0], start[1])
      ctx.lineTo(end[0], end[1])
      circle(ctx, end[0], end[1], 2)
    })
    ctx.fill()
    ctx.save()
      ctx.lineWidth = 1
      ctx.stroke()
    ctx.restore()
}

var min = Math.min
var max = Math.max

var intersect = require('box-intersect')

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

    // debug rendering
    ctx.strokeStyle = '#445'
    ctx.strokeRect(aabb[0], aabb[1], aabb[2] - aabb[0], aabb[3] - aabb[1])
    return aabb
  })

  // now compute the self intersections which will inform the next step (filtering)
  var isects = intersect(aabbs)

  // debug: compute and render the intersection of the intersections
  var overlaps = isects.map(function(pair) {
    var a = aabbs[pair[0]]
    var b = aabbs[pair[1]]

    var lbx = max(a[0], b[0])
    var lby = max(a[1], b[1])
    var ubx = min(a[2], b[2])
    var uby = min(a[3], b[3])

    ctx.fillStyle = 'hsla(99, 100%, 64%, .6)'
    ctx.fillRect(
      lbx+2,
      lby+2,
      (ubx - lbx) - 4,
      (uby - lby) - 4
    )

    return [
      lbx,
      lby,
      ubx,
      uby
    ]
  })

  console.log(overlaps)
}
