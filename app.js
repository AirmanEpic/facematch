window.nodeRequire = require

var $ = global.jQuery = require("./jquery-2.1.4.min")

e = nodeRequire("electron")
fs = nodeRequire("fs")

THREE = require("three")

mode = "handlePlacement"

var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

var renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.shadowMap.enabled = true
renderer.shadowMap.autoUpdate = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild( renderer.domElement )

camera.position.z = 0
camera.position.x = 0
camera.position.y = 0
var zoom = 45

mpos = {x:0,y:0}
var ctx = {}
var clicked_lm = 0


function main(){

}


function detectmob() { 
	if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
	){
		return true
	}
	else {
		return false
	}
}
window.onresize = function(event) {
	resizeDiv()
}

function resizeDiv() {

	vpw = $(window).width()
	vph = $(window).height()

	var m=detectmob()
}

$(document).ready(resizeDiv)
$(document).ready(main)