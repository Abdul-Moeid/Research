// general size parameters for the vis
var width = window.innerWidth;
var height = window.innerHeight;
var padding = { top: 40, right: 40, bottom: 40, left: 40 };
var plotAreaWidth = width - padding.left - padding.right;
var plotAreaHeight = height - padding.top - padding.bottom;

// when a lasso is completed, filter to the points within the lasso polygon
function handleLassoEnd(lassoPolygon) {
  var selectedPoints = points.filter(function (d) {
    // note we have to undo any transforms done to the x and y to match with the
    // coordinate system in the svg.
    var x = d.x + padding.left;
    var y = d.y + padding.top;

    return d3.polygonContains(lassoPolygon, [x, y]);
  });

  updateSelectedPoints(selectedPoints);
}

// reset selected points when starting a new polygon
function handleLassoStart(lassoPolygon) {
  updateSelectedPoints([]);
}

// when we have selected points, update the colors and redraw
function updateSelectedPoints(selectedPoints) {
  // if no selected points, reset to all tomato
  if (!selectedPoints.length) {
    // reset all
    points.forEach(function (d) {
      d.color = 'tomato';
    });

    // otherwise gray out selected and color selected black
  } else {
    points.forEach(function (d) {
      d.color = '#eee';
    });
    selectedPoints.forEach(function (d) {
      d.color = '#000';
    });
  }

  // redraw with new colors
  drawPoints();
}

// helper to actually draw points on the canvas
function drawPoints() {
  var context = canvas.node().getContext('2d');
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(padding.left, padding.top);

  // draw each point as a rectangle
  for (var i = 0; i < points.length; ++i) {
    var point = points[i];

    // draw circles
    context.fillStyle = point.color;
    context.beginPath();
    context.arc(point.x, point.y, point.r, 0, 2 * Math.PI);
    context.fill();
  }

  context.restore();
}

// create a container with position relative to handle our canvas layer
// and our SVG interaction layer
var visRoot = d3
  .select(document.body)
  .append('div')
  .attr('class', 'vis-root')
  .style('position', 'relative');

// main canvas to draw on
var screenScale = window.devicePixelRatio || 1;
var canvas = visRoot
  .append('canvas')
  .attr('width', width * screenScale)
  .attr('height', height * screenScale)
  .style('width', (width + "px"))
  .style('height', (height + "px"));
canvas
  .node()
  .getContext('2d')
  .scale(screenScale, screenScale);

// add in an interaction layer as an SVG
var interactionSvg = visRoot
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('position', 'absolute')
  .style('top', 0)
  .style('left', 0);

// attach lasso to interaction SVG
var lassoInstance = lasso()
  .on('end', handleLassoEnd)
  .on('start', handleLassoStart);

interactionSvg.call(lassoInstance);

// make up fake data
var points = d3.range(500).map(function () { return ({
  x: Math.random() * plotAreaWidth,
  y: Math.random() * plotAreaHeight,
  r: Math.random() * 5 + 2,
  color: 'tomato',
}); });

// initial draw of points
drawPoints();

