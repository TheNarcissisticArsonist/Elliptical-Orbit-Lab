//Constants


//Global Variables
var page = {};

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
	page.graph = document.getElementById("graph");
	page.animate = document.getElementById("animate");
	page.canvas = document.getElementById("graphArea");
	page.numInputList = document.getElementsByClassName("numInput");
}
function inputSetup() {
	console.log("FUNCTION CALL: inputSetup("+")");

	document.addEventListener("mousemove", function(event) { mouseMoved(event); });
	page.canvas.addEventListener("mousedown", function(event) { mousedown(event); });
	document.addEventListener("mouseup", function(event) { mouseup(event); });
	page.canvas.addEventListener("wheel", function(event) { wheel(event); });
	page.canvas.addEventListener("mouseenter", function(event) { mouseEnterCanvas(event); });
	page.canvas.addEventListener("mouseleave", function(event) { mouseLeaveCanvas(event); });

	for(var i=0; i<page.numInputList.length; ++i) {
		page.numInputList[i].addEventListener(focus, function() { this.select(); });
	}
}
function mouseMoved(event) {

}
function mousedown(event) {

}
function mouseup(event) {

}
function wheel(event) {

}
function mouseEnterCanvas(event) {

}
function mouseLeaveCanvas(event) {

}

//Executed Code

