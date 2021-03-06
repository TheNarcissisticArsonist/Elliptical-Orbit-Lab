//Constants
var defaults = {
	massCenter: "5.98E24",
	timeRate: String(60*60*24),
	calcRate: "1",
	dispRate: String(60*10),
	gConstant: "6.67E-11",
	iniPosX: "384405000",
	iniPosY: "0",
	iniVelX: "0",
	iniVelY: "1000",
	rEarth: "6.371E6",
	rMoon: "1.737E6",
	pos: [0, 0],
	zoom: 0.0000005,
	gridlines: true
};
var dragPanningConstant = 1/defaults.zoom; //This constant slows down the rate that dragging pans the graph.
var zoomPowerConstant = 1.1; //This is used when calculating the zoom factor when scrolling.
var mouseWheelCalibrationConstant = 53; //This is the value given when the mouse is scrolled one notch.
var axisColors = [["#ffaaaa", "#ff0000"], ["#aaaaff", "#0000ff"]]; //The colors for the axes. [[x-, x+], [y-, y+]]
var gridlinesColor = "#eeeeee";
var pathColor = "#000000";
var earthEdgeColor = "#0000ff";
var moonEdgeColor = "#222222";
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
var calcRate;
var dispRate;
var g;
var path = [];
var t0;
var dt;
var animating = false;
var rE;
var rM;
var orgStart;
var numSteps = 0;
var paused;

//Classes


//Functions
function setup() {
	console.log("FUNCTION CALL: setup()");

	page.massCenter = document.getElementById("massCenter");
	page.timeRate = document.getElementById("timeRate");
	page.calcRate = document.getElementById("calcRate");
	page.dispRate = document.getElementById("dispRate");
	page.gConstant = document.getElementById("gConstant");
	page.iniPosX = document.getElementById("iniPosX");
	page.iniPosY = document.getElementById("iniPosY");
	page.iniVelX = document.getElementById("iniVelX");
	page.iniVelY = document.getElementById("iniVelY");
	page.rEarth = document.getElementById("rEarth");
	page.rMoon = document.getElementById("rMoon");
	page.animate = document.getElementById("animate");
	page.pause = document.getElementById("pause");
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
	page.pause.addEventListener("click", function() { paused = !paused; });

	for(var i=0; i<page.numInputList.length; ++i) {
		page.numInputList[i].addEventListener(focus, function() { this.select(); });
	}
}
function loadDefaults() {
	console.log("FUNCTION CALL: loadDefaults()");

	page.massCenter.value = defaults.massCenter;
	page.timeRate.value = defaults.timeRate;
	page.calcRate.value = defaults.calcRate;
	page.dispRate.value = defaults.dispRate;
	page.gConstant.value = defaults.gConstant;
	page.iniPosX.value = defaults.iniPosX;
	page.iniPosY.value = defaults.iniPosY;
	page.iniVelX.value = defaults.iniVelX;
	page.iniVelY.value = defaults.iniVelY;
	page.rEarth.value = defaults.rEarth;
	page.rMoon.value = defaults.rMoon;
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
	else if(isNaN(page.timeRate.value)) {
		page.timeRate.focus();
		page.timeRate.select();
		return;
	}
	else if(isNaN(page.calcRate.value)) {
		page.calcRate.focus();
		page.calcRate.select();
	}
	else if(isNaN(page.dispRate.value)) {
		page.dispRate.focus();
		page.dispRate.select();
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
	else if(isNaN(page.rEarth.value)) {
		page.rEarth.focus();
		page.rEarth.select();
		return;
	}
	else if(isNaN(page.rMoon.value)) {
		page.rMoon.focus();
		page.rMoon.select();
		return;
	}

	earthMass = Number(page.massCenter.value);
	timeRate = Number(page.timeRate.value);
	dispRate = Number(page.dispRate.value);
	calcRate = Number(page.calcRate.value);
	g = Number(page.gConstant.value);
	moonPos = [Number(page.iniPosX.value), Number(page.iniPosY.value)];
	moonVel = [Number(page.iniVelX.value), Number(page.iniVelY.value)];
	rE = Number(page.rEarth.value);
	rM = Number(page.rMoon.value);

	path = [];
	path.push(moonPos.slice(0));

	t0 = window.performance.now();
	orgStart = t0;

	if(!animating) {
		requestAnimationFrame(animateLoop);
	}
	
	animating = true;
	paused = false;
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
	var t = window.performance.now();
	dt = t - t0;
	dt = dt / 1000; //Display ms to display s
	dt *= timeRate; //Display s to simulated s
	if(dt > calcRate) {
		t0 = t;

		clearAndResetCanvas();
		drawAxes();
		if(!paused) {
			updatePhys();
		}
		drawPath();
	}

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
function updatePhys() {
	for(var i=0; i<dt; i+=1/calcRate) { //For each simulated s elapsed run the following calculations calcRate times
		var r = Math.sqrt(Math.pow(moonPos[0], 2) + Math.pow(moonPos[1], 2));
		var theta = Math.atan2(moonPos[1], moonPos[0]);
		var notVecAcl = g * earthMass * (1/Math.pow(r, 2));
		var vecAcl = [];
		vecAcl[0] = -Math.cos(theta)*notVecAcl;
		vecAcl[1] = -Math.sin(theta)*notVecAcl;
		var sdt = 1/calcRate; //Simulated s to calculation-level s.
		moonVel[0] += vecAcl[0]*sdt; //Velocity increases by acceleration times simulated seconds divided by the calcRate
		moonVel[1] += vecAcl[1]*sdt;
		moonPos[0] += moonVel[0]*sdt; //Position increases by velocity times simulated seconds divided by the calcRate
		moonPos[1] += moonVel[1]*sdt;
		++numSteps;
		if(numSteps % dispRate == 0) {
			path.push(moonPos.slice(0)); //I may end up putting this outside the for loop.
		}
	}
}
function drawPath() {
	ctx.strokeStyle = pathColor;
	ctx.beginPath();
	ctx.moveTo(path[0][0], path[0][1]);
	for(var i=1; i<path.length; ++i) {
		ctx.lineTo(path[i][0], path[i][1]);
	}
	ctx.stroke();

	ctx.fillStyle = earthEdgeColor;
	ctx.beginPath();
	ctx.moveTo(rE, 0);
	ctx.arc(0, 0, rE, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = moonEdgeColor;
	ctx.beginPath();
	ctx.moveTo(moonPos[0]+rM, moonPos[1]);
	ctx.arc(moonPos[0], moonPos[1], rM, 0, 2*Math.PI);
	ctx.fill();
	ctx.fillStyle = "#000000";
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