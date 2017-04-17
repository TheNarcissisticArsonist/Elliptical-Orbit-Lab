//Constants
var defaults = {
	massCenter: "5.98E24",
	timeRatio: "60",
	gConstant: "6.67E-11",
	iniPosX: "1.27E7",
	iniPosY: "0",
	iniVelX: "0",
	iniVelY: "5.6E3",
	pos: [0, 0],
	zoom: 0.00005,
	gridlines: true
};
var dragPanningConstant = 1/defaults.zoom; //This constant slows down the rate that dragging pans the graph.
var zoomPowerConstant = 1.1; //This is used when calculating the zoom factor when scrolling.
var mouseWheelCalibrationConstant = 53; //This is the value given when the mouse is scrolled one notch.
var axisColors = [["#ffaaaa", "#ff0000"], ["#aaaaff", "#0000ff"]]; //The colors for the axes. [[x-, x+], [y-, y+]]
var gridlinesColor = "#eeeeee";
var pathColor = "#000000";
var graphTickLength = 10; //How tall the tick marks are on the graph.

//Global Variables
var page = {};
var inputValues = {};
var pos = [];
var zoom;
var mouseLocation = [];
var oldMouseLocation = [];
var mouseButtons = {};
var overCanvas = false;
var ctx;
var drawGridlines;
var moonPos = [];
var moonVel = [];
var earthMass;
var timeRate;
var g;
var path = [];
var t0;
var dt;

//Classes


//Functions
function setup() {
	console.log("FUNCTION CALL: setup()");

	page.massCenter = document.getElementById("massCenter");
	page.timeRatio = document.getElementById("timeRatio");
	page.gConstant = document.getElementById("gConstant");
	page.iniPosX = document.getElementById("iniPosX");
	page.iniPosY = document.getElementById("iniPosY");
	page.iniVelX = document.getElementById("iniVelX");
	page.iniVelY = document.getElementById("iniVelY");
	page.animate = document.getElementById("animate");
	page.canvas = document.getElementById("graphArea");
	page.numInputList = document.getElementsByClassName("numInput");
	page.gridlines = document.getElementById("gridlines");

	ctx = page.canvas.getContext("2d");

	inputSetup();

	loadDefaults();
}
function inputSetup() {
	console.log("FUNCTION CALL: inputSetup()");

	document.addEventListener("mousemove", function(event) { mouseMoved(event); });
	page.canvas.addEventListener("mousedown", function(event) { mousedown(event); });
	document.addEventListener("mouseup", function(event) { mouseup(event); });
	page.canvas.addEventListener("wheel", function(event) { wheel(event); });
	page.canvas.addEventListener("mouseenter", function(event) { mouseEnterCanvas(event); });
	page.canvas.addEventListener("mouseleave", function(event) { mouseLeaveCanvas(event); });
	page.animate.addEventListener("click", startAnimation);
	page.gridlines.addEventListener("click", function() { drawGridlines = this.checked; });

	for(var i=0; i<page.numInputList.length; ++i) {
		page.numInputList[i].addEventListener(focus, function() { this.select(); });
	}
}
function loadDefaults() {
	console.log("FUNCTION CALL: loadDefaults()");

	page.massCenter.value = defaults.massCenter;
	page.timeRatio.value = defaults.timeRatio;
	page.gConstant.value = defaults.gConstant;
	page.iniPosX.value = defaults.iniPosX;
	page.iniPosY.value = defaults.iniPosY;
	page.iniVelX.value = defaults.iniVelX;
	page.iniVelY.value = defaults.iniVelY;
	pos = defaults.pos.slice(0);
	zoom = defaults.zoom;
	page.gridlines.checked = defaults.gridlines;
	drawGridlines = page.gridlines.checked;
}
function startAnimation() {
	console.log("FUNCTION CALL: animate()");

	if(isNaN(page.massCenter.value)) {
		page.massCenter.focus();
		page.massCenter.select();
		return;
	}
	else if(isNaN(page.timeRatio.value)) {
		page.timeRatio.focus();
		page.timeRatio.select();
		return;
	}
	else if(isNaN(page.gConstant.value)) {
		page.gConstant.focus();
		page.gConstant.select();
		return;
	}
	else if(isNaN(page.iniPosX.value)) {
		page.iniPosX.focus();
		page.iniPosX.select();
		return;
	}
	else if(isNaN(page.iniPosY.value)) {
		page.iniPosY.focus();
		page.iniPosy.select();
		return;
	}
	else if(isNaN(page.iniVelX.value)) {
		page.iniVelX.focus();
		page.iniVelX.select();
		return;
	}
	else if(isNaN(page.iniVelY.value)) {
		page.iniVelY.focus();
		page.inivelY.select();
		return;
	}

	earthMass = Number(page.massCenter.value);
	timeRate = Number(page.timeRatio.value);
	g = Number(page.gConstant.value);
	moonPos = [Number(page.iniPosX.value), Number(page.iniPosY.value)];
	moonVel = [Number(page.iniVelX.value), Number(page.iniVelY.value)];

	path = [];
	path.push(moonPos.slice(0));

	t0 = new Date().getTime();

	requestAnimationFrame(animateLoop);
}
function clearAndResetCanvas() {
	//console.log("FUNCTION CALL: clearAndResetCanvas()");

	ctx.setTransform(1, 0, 0, 1, 0, 0); //Reset all context transforms
	ctx.clearRect(0, 0, page.canvas.width, page.canvas.height); //Clear the entire canvas
	ctx.beginPath(); //Start a new line path.
	ctx.transform(1, 0, 0, 1, page.canvas.width/2, page.canvas.height/2); //Put 0,0 in the center of the canvas
	ctx.transform(zoom, 0, 0, zoom, 0, 0); //Scale the canvas
	ctx.transform(1, 0, 0, -1, 0, 0); //Flip the canvas vertically.
	ctx.lineWidth = 1/zoom; //Keep the lines the same thickness.
	ctx.font = "10px";
	ctx.transform(1, 0, 0, 1, -pos[0], -pos[1]);
}
function animateLoop() {
	var t = new Date().getTime();
	dt = t - t0;
	t0 = t;

	clearAndResetCanvas();
	drawAxes();
	updatePos();
	updateVel();
	drawPath();

	requestAnimationFrame(animateLoop);
}
function drawAxes() {
	var w = page.canvas.width/zoom;
	var w0 = pos[0];
	var h = page.canvas.height/zoom;
	var h0 = pos[1];

	var bounds = [[(-w/2)+w0, (w/2)+w0], [(-h/2)+h0, (h/2)+h0]]; //[[xmin, xmax], [ymin, ymax]];

	ctx.strokeStyle = axisColors[0][0]; //x-
	ctx.moveTo(0, 0);
	ctx.lineTo(bounds[0][0], 0);
	ctx.stroke(); ctx.beginPath();
	ctx.strokeStyle = axisColors[0][1]; //x+
	ctx.moveTo(0, 0);
	ctx.lineTo(bounds[0][1], 0);
	ctx.stroke(); ctx.beginPath();
	ctx.strokeStyle = axisColors[1][0]; //y-
	ctx.moveTo(0, 0);
	ctx.lineTo(0, bounds[1][0]);
	ctx.stroke(); ctx.beginPath();
	ctx.strokeStyle = axisColors[1][1]; //y+
	ctx.moveTo(0, 0);
	ctx.lineTo(0, bounds[1][1]);
	ctx.stroke(); ctx.beginPath();

	ctx.strokeStyle = "#000000";

	var intervalMagnitude = Math.floor(Math.log10(w));
	var interval = Math.pow(10, intervalMagnitude-1);
	var tickLength = graphTickLength/zoom;
	var tickPos = [0, 0];
	var numChars;
	while(tickPos[0] > bounds[0][0]) {
		tickPos[0] -= interval;
		if(drawGridlines) {
			ctx.beginPath();
			ctx.strokeStyle = gridlinesColor;
			ctx.moveTo(tickPos[0], bounds[1][0]);
			ctx.lineTo(tickPos[0], bounds[1][1]);
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
		}
		ctx.moveTo(tickPos[0], tickPos[1]+(tickLength/2));
		ctx.lineTo(tickPos[0], tickPos[1]-(tickLength/2));
		ctx.stroke();
		numChars = 2+Math.floor(Math.abs(Math.log10(interval)));
		if(tickPos[0] < 0) {
			++numChars;
		}
		drawVerticalText(makeGraphMarkers(String(tickPos[0]).slice(0, numChars)), tickPos[0], tickPos[1]+tickLength);
	}
	tickPos = [0, 0];
	while(tickPos[0] < bounds[0][1]) {
		tickPos[0] += interval;
		if(drawGridlines) {
			ctx.beginPath();
			ctx.strokeStyle = gridlinesColor;
			ctx.moveTo(tickPos[0], bounds[1][0]);
			ctx.lineTo(tickPos[0], bounds[1][1]);
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
		}
		ctx.moveTo(tickPos[0], tickPos[1]+(tickLength/2));
		ctx.lineTo(tickPos[0], tickPos[1]-(tickLength/2));
		ctx.stroke();
		numChars = 2+Math.floor(Math.abs(Math.log10(interval)));
		if(tickPos[0] < 0) {
			++numChars;
		}
		drawVerticalText(makeGraphMarkers(String(tickPos[0]).slice(0, numChars)), tickPos[0], tickPos[1]+tickLength);
	}
	tickPos = [0, 0];
	while(tickPos[1] > bounds[1][0]) {
		tickPos[1] -= interval;
		if(drawGridlines) {
			ctx.beginPath();
			ctx.strokeStyle = gridlinesColor;
			ctx.moveTo(bounds[0][0], tickPos[1]);
			ctx.lineTo(bounds[0][1], tickPos[1]);
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
		}
		ctx.moveTo(tickPos[0]+(tickLength/2), tickPos[1]);
		ctx.lineTo(tickPos[0]-(tickLength/2), tickPos[1]);
		ctx.stroke();
		numChars = 2+Math.floor(Math.abs(Math.log10(interval)));
		if(tickPos[1] < 0) {
			++numChars;
		}
		drawHorizontalText(makeGraphMarkers(String(tickPos[1]).slice(0, numChars)), tickPos[0]+tickLength, -tickPos[1]);
	}
	tickPos = [0, 0];
	while(tickPos[1] < bounds[1][1]) {
		tickPos[1] += interval;
		if(drawGridlines) {
			ctx.beginPath();
			ctx.strokeStyle = gridlinesColor;
			ctx.moveTo(bounds[0][0], tickPos[1]);
			ctx.lineTo(bounds[0][1], tickPos[1]);
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
		}
		ctx.moveTo(tickPos[0]+(tickLength/2), tickPos[1]);
		ctx.lineTo(tickPos[0]-(tickLength/2), tickPos[1]);
		ctx.stroke();
		numChars = 2+Math.floor(Math.abs(Math.log10(interval)));
		if(tickPos[1] < 0) {
			++numChars;
		}
		drawHorizontalText(makeGraphMarkers(String(tickPos[1]).slice(0, numChars)), tickPos[0]+tickLength, -tickPos[1]);
	}
}
function updatePos() {
	for(var i=0; i<moonPos.length; ++i) {
		moonPos[i] += moonVel[i]*(1000*dt*(timeRate/defaults.timeRatio));
	}
	path.push(moonPos.slice(0));
}
function updateVel() {
	var r = Math.sqrt(Math.pow(moonPos[0], 2) + Math.pow(moonPos[1], 2));
	var theta = Math.atan2(moonPos[1], moonPos[0]);
	var notVecAcl = g * earthMass * (1/Math.pow(r, 2));
	var vecAcl = [];
	vecAcl[0] = -Math.cos(theta)*notVecAcl;
	vecAcl[1] = -Math.sin(theta)*notVecAcl;
	moonVel[0] += vecAcl[0]*(1000*dt*(timeRate/defaults.timeRatio));
	moonVel[1] += vecAcl[1]*(1000*dt*(timeRate/defaults.timeRatio));
}
function drawPath() {
	ctx.strokeStyle = pathColor;
	ctx.beginPath();
	ctx.moveTo(path[0][0], path[0][1]);
	for(var i=1; i<path.length; ++i) {
		ctx.lineTo(path[i][0], path[i][1]);
	}
	ctx.stroke();

	ctx.strokeStyle = "#000000";
	ctx.beginPath();
}
function drawHorizontalText(text, x, y) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.transform(1, 0, 0, 1, page.canvas.width/2, page.canvas.height/2); //Put 0,0 in the center of the canvas
	ctx.transform(zoom, 0, 0, zoom, 0, 0); //Scale the canvas
	ctx.transform(1, 0, 0, 1, -pos[0], pos[1]);
	ctx.transform(1, 0, 0, 1, x, y);
	ctx.transform(1/zoom, 0, 0, 1/zoom, 0, 0);
	ctx.fillText(text, 0, 3);
	ctx.restore();
}
function drawVerticalText(text, x, y) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.transform(1, 0, 0, 1, page.canvas.width/2, page.canvas.height/2); //Put 0,0 in the center of the canvas
	ctx.transform(zoom, 0, 0, zoom, 0, 0); //Scale the canvas
	ctx.transform(1, 0, 0, 1, -pos[0], pos[1]);
	ctx.transform(1, 0, 0, 1, x, y);
	ctx.transform(1/zoom, 0, 0, 1/zoom, 0, 0);
	ctx.transform(0, 1, -1, 0, 0, 0);
	ctx.fillText(text, 0, 3);
	ctx.restore();
}
function makeGraphMarkers(text) {
	var arr = text.split("");
	var numCommas = 0;
	if(!(arr[1] == "." || arr[2] == ".")) {
		for(var i=arr.length-1; i>0; --i) {
			if(arr[i-1] == "-") {
				break;
			}
			else if(((arr.length-i)-numCommas) % 3 == 0) {
				arr.splice(i, 0, ",");
				++numCommas;
				--i;
			}
		}
	}
	arr.push(" m");
	return arr.join("");
}
function mouseMoved(event) {
	oldMouseLocation[0] = mouseLocation[0];
	oldMouseLocation[1] = mouseLocation[1];
	mouseLocation[0] = event.clientX;
	mouseLocation[1] = event.clientY;

	if(mouseButtons["1"] && overCanvas) {
		var delta = [0, 0];
		delta[0] = mouseLocation[0]-oldMouseLocation[0];
		delta[1] = mouseLocation[1]-oldMouseLocation[1];

		pos[0] += -1 * delta[0] * dragPanningConstant * defaults.zoom * (1/zoom);
		pos[1] += delta[1] * dragPanningConstant * defaults.zoom * (1/zoom);
	}
}
function mousedown(event) {
	//
	mouseButtons[String(event.which)] = true;
}
function mouseup(event) {
	//
	mouseButtons[String(event.which)] = false;
}
function wheel(event) {
	event.preventDefault();
	event.returnValue = false;
	var wheelChange = event.deltaY;
	var zoomMultiplier = Math.pow(zoomPowerConstant, wheelChange*(1/mouseWheelCalibrationConstant)); //I may want to change how this zoom works later.
	zoom /= zoomMultiplier;
}
function mouseEnterCanvas(event) {
	//
	overCanvas = true;
}
function mouseLeaveCanvas(event) {
	//
	overCanvas = false;
}

//Executed Code
window.setTimeout(setup, 0);