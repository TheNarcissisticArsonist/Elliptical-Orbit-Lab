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
	zoom: 50
};
var dragPanningConstant = 1/40; //This constant slows down the rate that dragging pans the graph.

//Global Variables
var page = {};
var inputValues = {};
var pos = [];
var zoom;
var mouseLocation = [];
var oldMouseLocation = [];
var mouseButtons = {};
var overCanvas = false;

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
	page.animate.addEventListener("click", animate);

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
}
function animate() {
	console.log("FUNCTION CALL: animate()");

	initialCanvasSetup();
	requestAnimationFrame(animateLoop);
}
function initialCanvasSetup() {
	console.log("FUNCTION CALL: initialCanvasSetup()");

	context.setTransform(1, 0, 0, 1, 0, 0); //Reset all context transforms
	context.clearRect(0, 0, page.canvas.width, page.canvas.height); //Clear the entire canvas
	context.fillRect(0, 0, page.canvas.width, page.canvas.height);
	context.beginPath(); //Start a new line path.
	context.transform(1, 0, 0, 1, page.canvas.width/2, page.canvas.height/2); //Put 0,0 in the center of the canvas
	context.transform(zoom, 0, 0, zoom, 0, 0); //Scale the canvas
	context.transform(1, 0, 0, -1, 0, 0); //Flip the canvas vertically.
	context.lineWidth = 1/zoom; //Keep the lines the same thickness.
}
function animateLoop() {
	console.log("animateLoop()");

}
function mouseMoved(event) {
	mouseLocation[0] = event.clientX;
	mouseLocation[1] = event.clientY;

	if(mouseButtons["1"] && overCanvas) {
		var delta = [0, 0];
		delta[0] = mouseLocation[0]-oldMouseLocation[0];
		delta[1] = mouseLocation[1]-oldMouseLocation[1];
		
		pos[0] += delta[0] * dragPanningConstant * defaults.zoom * (1/zoom);
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