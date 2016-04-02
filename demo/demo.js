var fc = require('fc')
var center = require('ctx-translate-center')
var circle = require('ctx-circle')
var grid = require('ctx-render-grid-lines')

// var pslgOffset = require('../pslg-offset')

var poly = {
  points: [
    [-115,  100],
    [ 103,  100],
    [ 107,  50],
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
  var radius = 10
  var diameter = radius*2

  ctx.beginPath()
    grid(ctx, diameter, -radius*20, -radius*20, radius*20, radius*20)
    ctx.strokeStyle = "rgba(44,44,44,.6)"
    ctx.stroke()

  poly.points.forEach(function(point, i) {
    var box = diabox(point, radius)
    ctx.strokeStyle = "green"
    ctx.strokeRect(
      box[0],
      box[1],
      box[2] - box[0],
      box[3] - box[1]
    )
  })

  poly.edges.forEach(function(edge) {
    var point = poly.points[edge[0]]
    var next = poly.points[edge[1]]

    var nextCell = impcell(next, radius)

    calcStraightLine2d(point, next, radius, function(x, y) {
      var currentCell = impcell([x, y], radius)

      var box = diabox([x, y], radius)
      ctx.strokeRect(
        box[0],
        box[1],
        box[2] - box[0],
        box[3] - box[1]
      )

      if (currentCell[0] === nextCell[0] && currentCell[1] == nextCell[1]) {
        return false;
      }
    })
  })

  // var offset = pslgOffset(poly.edges, poly.points, radius, ctx)

  // drawPoly(ctx, offset.edges, offset.points)
  drawPoly(ctx, poly.edges, poly.points)
}, true)

function drawPoly(ctx, edges, points, stroke, fill) {
  ctx.fillStyle = fill || 'hsl(220, 100%, 55%)'
  ctx.strokeStyle = stroke || 'hsl(220, 100%, 55%)'
  ctx.beginPath()
    poly.points[0][0] = Math.sin(Date.now() / 500) * 20
    poly.points[0][1] = Math.cos(Date.now() / 1000) * 100

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

function impcell(point, r) {
  var x = point[0]
  var y = point[1]
  var d = r * 2
  var dx = Math.round(x / d) * d
  var dy = Math.round(y / d) * d

  return [dx, dy]
}

function diabox(point, r) {
  var cellCenter = impcell(point, r)

  return [
    cellCenter[0] - r,
    cellCenter[1] - r,
    cellCenter[0] + r,
    cellCenter[1] + r
  ]
}

function sign(a) {
  return typeof a === 'number' ? a ? a < 0 ? -1 : 1 : a === a ? 0 : 0 : 0
}


function calcStraightLine2d(start, end, r, visit) {
  var dx = (end[0] - start[0])
  var dy = (end[1] - start[1])
  var m = 1/Math.sqrt(dx*dx + dy*dy)

  var nx = dx * m;
  var ny = dy * m;

  var max, min;
  if (Math.abs(nx) > Math.abs(ny)) {
    max = nx;
    min = ny;
  } else {
    max = ny;
    min = nx
  }

  var step = Math.abs((1/max) * min) * r*2;

  var ix = start[0] + nx * step;
  var iy = start[1] + ny * step;
  var lx = ix|0;
  var ly = iy|0;

  var sentnel = 100;
  while (sentnel--) {

    var rx = ix|0;
    var ry = iy|0;

    ix += nx * step;
    iy += ny * step;


    if (sign(rx - lx) || sign(ry - ly)) {
      // if (lx >= 0 && ly >= 0 && lx < aabb[1][0] && ly < aabb[1][1]) {
        if (visit(lx, ly) === false) {
          break
        }

        //  if (pixels.get(lx, ly)) {
        //   console.log('holy shit', 10000-sentnel);
        //   return [lx, ly];
        // }
      // }

      lx = rx;
      ly = ry;
    }
  }
}
