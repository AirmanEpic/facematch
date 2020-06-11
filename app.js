window.nodeRequire = require

var $ = global.jQuery = require("./jquery-2.1.4.min")

const e = require('electron').remote
fs = nodeRequire("fs")
var sizeOf = require('image-size');

THREE = require("three")
dialog = e.dialog

mode = "handlePlacement"

var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

var renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.shadowMap.enabled = true
renderer.shadowMap.autoUpdate = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild( renderer.domElement )

const facePath = "Standard_face.obj"

camera.position.z = 50
camera.position.x = 0
camera.position.y = 0
var zoom = 45

mpos = {x:0,y:0}
var ctx = {}
var clicked_lm = 0
var humanFaceGeo = {}
var humanFace = {}
var images = [] //array of views of face
var currentImage = 0;

function main(){
	init()
	render()
	askForImage(function(image){
		//console.log(image)
		images.push({file:image[0]})
	})
}

function render(){
	renderer.render(scene,camera)

	if (images.length!=0){
		curImg = images[currentImage]
		if (!curImg.geo){
			//generate geo and stick it to the man - I mean, the scene
			imgMaterial = new THREE.MeshBasicMaterial()
			//imgMaterial.color = new THREE.Color("#00FF00")
			new THREE.TextureLoader().load(curImg.file,function(texture){
				//console.log("readY!")
				//imgMaterial.color = new THREE.Color(1,255,1)
				// texture.wrapS = THREE.RepeatWrapping;
				// texture.wrapT = THREE.RepeatWrapping;
				// texture.repeat.set( 4, 4 );
				imgMaterial.map = texture
	
				imgMaterial.side = THREE.DoubleSide
				var dimensions = sizeOf(curImg.file);
				w = dimensions.width;
				h = dimensions.height
				curImg.geo = new THREE.PlaneGeometry(dimensions.width/10,dimensions.height/10,1)
	
				 const map1 = [
	                new THREE.Vector2(0, 0), // [x,y] bottom left point
	                new THREE.Vector2(1, 0), // [x,y] bottom right point
	                new THREE.Vector2(1, 1), // [x,y] top right point
	                new THREE.Vector2(0, 1)  // [x,y] top left point
	
	            ]
				curImg.geo.faceVertexUvs[0] = []
	            curImg.geo.faceVertexUvs[0][0] = [map1[3],map1[0],map1[2]]
	            curImg.geo.faceVertexUvs[0][1] = [map1[0],map1[1],map1[2]]
	    	
				curImg.mesh = new THREE.Mesh(curImg.geo,imgMaterial)
	
				scene.add(curImg.mesh)
			})
		}

		if (curImg){
			//lock this thing to the camera.
			dist = 50
		}
	}

	requestAnimationFrame(render)
}

function loadMainFace(){
	var dataBack = {v:[],f:[],n:[],t:[]}
	var datastr = fs.readFileSync( facePath ).toString()
	var datastrLines = datastr.split("\n")
	datastrLines.forEach(function(lineStr){
		if (lineStr.charAt(0)=="v" && lineStr.charAt(1)==" "){
			//this is a vertex line
			var vertex = lineStr.split(" ")
			var vX = parseFloat(vertex[1])
			var vY = parseFloat(vertex[2])
			var vZ = parseFloat(vertex[3])

			dataBack.v.push({x:vX,y:vY,z:vZ})
		}

		if (lineStr.charAt(0)=="v" && lineStr.charAt(1)=="n"){
			//this is a vertex normal line
			var normal = lineStr.split(" ")
			var nX = parseFloat(normal[1])
			var nY = parseFloat(normal[2])
			var nZ = parseFloat(normal[3])

			dataBack.n.push({x:nX,y:nY,z:nZ})
		}

		if (lineStr.charAt(0)=="v" && lineStr.charAt(1)=="t"){
			//this is a texture line
			var tex = lineStr.split(" ")
			var tU = parseFloat(tex[1])
			var tV = parseFloat(tex[2])

			dataBack.t.push({x:tU,y:tV})
		}

		if (lineStr.charAt(0)=="f" && lineStr.charAt(1)==" "){
			//this is a face line
			var faceVerts = lineStr.split(" ")
			faceVerts.splice(0,1) // remove first index; this is just the letter.
			var pnts = []
			var ns = []
			var ts = []
			faceVerts.forEach(function(vert,ind){
				vspl = vert.split("/")
				pnts.push(parseInt(vspl[0])-1)
				ns.push(parseInt(vspl[1]))
				ts.push(parseInt(vspl[2]))
			})

			dataBack.f.push({p:pnts,n:ns,t:ts})
		}
	})

	return dataBack;
}

function objToThreeJS(data){
	var startObject = new THREE.Geometry();

	data.v.forEach(function(vert){
		startObject.vertices.push(new THREE.Vector3(vert.x,vert.y,vert.z))
	})
	
	data.f.forEach(function(face){
		//console.log("messing with a face that looks like "+JSON.stringify(face))
		if (face.p.length==3){
			var normal = [
				new THREE.Vector3(face.n[0].x,face.n[0].y,face.n[0].z),
				new THREE.Vector3(face.n[1].x,face.n[1].y,face.n[1].z),
				new THREE.Vector3(face.n[2].x,face.n[2].y,face.n[2].z)
			]
			startObject.faces.push(new THREE.Face3(face.p[0],face.p[1],face.p[2])) // these functions may need vertex and texture data; for now this is fine.
		}
		if (face.p.length==4){
			var normal1 = [
				new THREE.Vector3(face.n[0].x,face.n[0].y,face.n[0].z),
				new THREE.Vector3(face.n[2].x,face.n[2].y,face.n[2].z),
				new THREE.Vector3(face.n[1].x,face.n[1].y,face.n[1].z)
			]
			var normal2 = [
				new THREE.Vector3(face.n[0].x,face.n[0].y,face.n[0].z),
				new THREE.Vector3(face.n[2].x,face.n[2].y,face.n[2].z),
				new THREE.Vector3(face.n[3].x,face.n[3].y,face.n[3].z)
			]
			face1 = new THREE.Face3(face.p[1],face.p[2],face.p[0])
			face2 = new THREE.Face3(face.p[0],face.p[2],face.p[3])
			face1.vertexNormals = normal1;
			face2.vertexNormals = normal2;
			startObject.faces.push(face1) // these functions may need vertex and texture data; for now this is fine.
			startObject.faces.push(face2) // these functions may need vertex and texture data; for now this is fine.
		}
	})

	return startObject;
}

function init(){
	var mainFace = loadMainFace()
	humanFaceGeo = objToThreeJS(mainFace);
	humanFaceGeo.computeVertexNormals();

	var material = new THREE.MeshLambertMaterial({color:'#326a85',emissive:'#1d2c33'}) //,emissive:'#89CFF0'
	//material.color = new THREE.Color(0xffffff) // "#89CFF0"
	// material.transparent = true;
	// material.opacity = 0.5;
	material.side = THREE.DoubleSide;
	humanFace = new THREE.Mesh( humanFaceGeo, material)
	humanFace.position.y = -150

	scene.add(humanFace)

	var geometry = new THREE.BoxGeometry();
	var cube = new THREE.Mesh( geometry, material );

	scene.add(cube)
	var light = new THREE.PointLight( 0xffffff, 1, 100000 )
	//light.decay = 0.1
	light.position.set(camera.position.x,camera.position.y,camera.position.z)
	scene.add( light );
}

function askForImage(myCallback){

 	dialog.showOpenDialog({
        properties: ['openFile'],
        filters:[{name:"images",extensions: ['jpg', 'png', 'jpeg']}]
    }, function (files) {
        if (files !== undefined) {
            // handle files
            myCallback(files)
        }
    });

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