//this is a very abstract and terrible representation of a drumset, a place where I spend much of my time

/*I stole a lot of code from a lot of places, including:
https://threejs.org/docs/#api/en/lights/Light
https://threejs.org/docs/#api/en/geometries/CylinderGeometry
https://editor.p5js.org/tuantinghuang/full/HYMnodlAv (classmate!)
https://www.youtube.com/watch?v=bsLosbweLNE
https://editor.p5js.org/dylanbeattie/sketches/2idPAHbNM
https://threejs-journey.com/lessons/shadows
Rotate and scale geometry - Questions - three.js forum
discourse.threejs.org*/


import * as THREE from 'three';

//import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
//import { TextureLoader } from 'three/addons/loaders/TextureLoader.js';
import { Water } from 'three/addons/objects/Water2.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';

let scene, camera, loader, mtlLoader, controls, mat, renderer; 
let textureLoader, texture1;
let light, light2, dLightHelper;
let speaker;
let p1, p2;
let water,water2,water3,water4,water5,water6,water7,water8;
let waterGroup1, waterGroup2, waterGroup3, waterGroup4;
let floorGroup;
//need mixer or clock here?
let composer;
let pot,window1,me, sofa;

let audioListener;
let audioListenerMesh;
let audioSources = [];

const clock = new THREE.Clock();

const params = {
	color: '#ffffff',
	scale: 1,
	flowX: 1,
	flowY: 1,
	exposure: 1,
	bloomStrength: 0.38,
	bloomThreshold: 0.35,
	bloomRadius: 0
};



//INIT FUNCTION//
function init(){
waterGroup1 = new THREE.Group();
waterGroup2 = new THREE.Group();
// waterGroup3 = new THREE.Group();
// waterGroup4 = new THREE.Group();
scene = new THREE.Scene();
scene.add( new THREE.AmbientLight( 0xffffff ) );
scene.background = new THREE.Color('blue');

camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
const pointLight = new THREE.PointLight( 0xffffff, 1 );
camera.add( pointLight );

const renderScene = new RenderPass( scene, camera );

renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ReinhardToneMapping;
	// renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;

	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );

//no idea if there's a better way to do this
const stairGroup = new THREE.Group(); 
const stairGroup2 = new THREE.Group(); 
const stairGroup3 = new THREE.Group();
const stairGroup4 = new THREE.Group();
const speakGroup = new THREE.Group();
floorGroup = new THREE.Group();

loader = new OBJLoader();
mtlLoader = new MTLLoader();
textureLoader = new THREE.TextureLoader();
const sofaColor = textureLoader.load('sofa/TEXTURAS/Tela blanca.jpg');
const sofaBumpMap = textureLoader.load('sofa/TEXTURAS/Tela gris bump.jpg');
//controls = new OrbitControls(camera, renderer.domElement);
controls = new FirstPersonControls( camera, renderer.domElement );
controls.movementSpeed = 10;
controls.lookSpeed = 0.3;

//this doesn't seem to do anything!
mat = new THREE.MeshPhongMaterial({
	color: 'blue'
});

//2d textures and stuff
loadPlanes();
addSpatialAudio();


//this is for the two speakers in the basement
mtlLoader.load("OBJ/driver+corneta_01.mtl", function(materials)
{
    materials.preload();
	materials.set
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("OBJ/driver+corneta_01.obj", function(object)
    {    
        speaker = object;
		speaker.rotateX(Math.PI/2);
		speaker.scale.set(10,10,10);
		speaker.position.set(5,-20,-10);
		let s2 = speaker.clone();
		s2.position.set(-5,-20,-10);
		speakGroup.add(speaker);
		speakGroup.add(s2);
        scene.add( speakGroup );
		//console.log("hello?")
    });
});

//this is for the cooking pot in the kitchen area
mtlLoader.load("pot20l_obj/pot20l_v2.mtl", function(materials)
{
    materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("pot20l_obj/pot20l_v2.obj", function(object)
    {    
		pot = object;
		scene.add(pot);
		pot.scale.set(20,20,20);
		pot.position.set(0,3,15);
		//console.log("hello?")
    });
});

mtlLoader.load("scan_of_me_poly/textured.mtl", function(materials)
{
    materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("scan_of_me_poly/textured.obj", function(object)
    {    
		me = object;
		scene.add(me);
		me.scale.set(5,5,5);
		me.position.set(48,30,15);
		me.rotateY(Math.PI/2);
		//console.log("hello?")
    });
});

//big window somewhere
mtlLoader.load("window_big_obj/window_big.mtl", function(materials)
{
    materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("window_big_obj/window_big.obj", function(object)
    {    
		window1 = object;
		//scene.add(window1);
		// pot.scale.set(20,20,20);
		// pot.position.set(0,3,15);
		//console.log("hello?")
    });
});

mtlLoader.load("sofa/sofa.mtl", function(materials)
{
	let myMat = materials;
	myMat.map = sofaColor;
	myMat.bumpMap = sofaBumpMap;
 	//materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(myMat);
    objLoader.load("sofa/sofa.obj", function(object)
    {    
		sofa = object;
		sofa.scale.set(0.05,0.05,0.05);
		sofa.position.set(-5,48,0);
		sofa.rotateY(Math.PI/2);
		scene.add(sofa);
		// pot.scale.set(20,20,20);
		// pot.position.set(0,3,15);
		//console.log("hello?")
    });
});

loader.load('lightwave stairs/objects/stairs.lwo.obj', function ( object ) {
		object.traverse(function(node) {
			if ( node.isMesh ) node.material = mat;
		});

        object.scale.set(5,5,5);
		//could make a for loop for this
		let stairs = object;
		let silly = stairs.clone();
		stairs.position.set(0,0,0);
		silly.position.set(0,11,-15);
		let s2 = stairs.clone();
		let s3 = silly.clone();
		let s4 = stairs.clone();
		let s5 = silly.clone();
		let s6 = stairs.clone();
		let s7 = silly.clone();
		stairGroup2.add(s2);
		stairGroup2.add(s3);
		stairGroup3.add(s4);
		stairGroup3.add(s5);
		stairGroup4.add(s6);
		stairGroup4.add(s7);
		
		stairGroup.add(silly);
		stairGroup.add(stairs);
	    scene.add(stairGroup);

		//here's where the things are
		stairGroup.position.set(15,0,-10);
		stairGroup2.position.set(33,24,10);
		stairGroup.rotateY(-Math.PI/2);
		stairGroup2.rotateY(Math.PI/2);
		stairGroup3.position.set(0,48,-25);
		stairGroup4.position.set(-12,-23,10);
		scene.add(stairGroup2);
		scene.add(stairGroup3);
		scene.add(stairGroup4);
		
	},
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function ( error ) {
		console.log( 'An error happened' );
	}
);

//water

const waterGeometry = new THREE.PlaneGeometry( 120, 120 );

//there HAS TO BE A BETTER WAY
water = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water2 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water3 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water4 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water5 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water6 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water7 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );
water8 = new Water( waterGeometry, {
	color: params.color,
	scale: params.scale,
	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
	textureWidth: 1024,
	textureHeight: 1024
} );

//TODO make water double-sided
water.position.y = 1;
water.rotation.x = Math.PI * - 0.5;
water.rotateY(Math.PI/2);
water3.rotateY(Math.PI/2);
// water5.rotateY(Math.PI/2);
// water7.rotateY(Math.PI/2);

//water2.rotateY(-Math.PI/2);
water2.position.set(120,0,120);
water4.rotateY(-Math.PI/2);
// water6.rotateY(-Math.PI/2);
// water8.rotateY(-Math.PI/2);
 water2.position.set(-0.1,0,0);
// water4.position.set(-0.1,0,0);
// water6.position.set(-0.1,0,0);
// water8.position.set(-0.1,0,0);

waterGroup1.add(water);
waterGroup1.add(water2);
waterGroup2.add(water3);
waterGroup2.add(water4);
// waterGroup3.add(water5);
// waterGroup3.add(water6);
// waterGroup4.add(water7);
// waterGroup4.add(water8);
//let w2 = water.clone();
//w2.rotateY(-Math.PI);
//scene.add(waterGroup1);
water.position.set(-30,20,0);
water2.position.set(30,20,-60);
scene.add(water);
scene.add(water2);
//scene.add(water3);
//waterGroup1.position.set(-30,20,0);
//scene.add(waterGroup2);
// scene.add(waterGroup3);
// scene.add(waterGroup4);

const gui = new GUI();

				gui.addColor( params, 'color' ).onChange( function ( value ) {

					water.material.uniforms[ 'color' ].value.set( value );

				} );
				gui.add( params, 'scale', 1, 10 ).onChange( function ( value ) {

					water.material.uniforms[ 'config' ].value.w = value;

				} );
				gui.add( params, 'flowX', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {

					water.material.uniforms[ 'flowDirection' ].value.x = value;
					water.material.uniforms[ 'flowDirection' ].value.normalize();

				} );
				gui.add( params, 'flowY', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {

					water.material.uniforms[ 'flowDirection' ].value.y = value;
					water.material.uniforms[ 'flowDirection' ].value.normalize();

				} );

				gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

					renderer.toneMappingExposure = Math.pow( value, 4.0 );

				} );

				gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

					bloomPass.threshold = Number( value );

				} );

				gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

					bloomPass.strength = Number( value );

				} );

				gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

					bloomPass.radius = Number( value );

				} );
				
				//could close also
				//gui.open();
				gui.hide();


//interesting effect found on the internet
//scene.fog = new THREE.FogExp2(0x01131e, 0.025);

//make a background appear
addBackground();
  
light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 0, 20, 8 ); //default; light shining from top
light.castShadow = true; // default false
light.lookAt(0,0);
//light.lookAt(ftLeg);
scene.add( light );

light2 = new THREE.DirectionalLight( 0xffffff, 3 );
light2.position.set( 48, 60, 8 );
light2.lookAt(48,30,15);
scene.add(light2);

dLightHelper = new THREE.DirectionalLightHelper(light);
scene.add(dLightHelper);
  
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default
  
camera.position.y = 5;
camera.position.z = 10;
camera.lookAt(0,0,0);

draw();
}

//floor
function loadPlanes(){
	let m1 = new THREE.MeshBasicMaterial();
	let pg = new THREE.BoxGeometry(20,0.1,40);
	p1 = new THREE.Mesh(pg,m1);
	p2 = new THREE.Mesh(pg,m1);
	let p3 = new THREE.Mesh(pg,m1);
	p2.position.set(48,24,0);
	p3.position.set(0,48,0);
	floorGroup.add(p1);
	floorGroup.add(p2);
	floorGroup.add(p3);
	scene.add(floorGroup);
	}

function addSpatialAudio(){
	audioListener = new THREE.AudioListener();
	//not sure if need to set to camera or not
	camera.add(audioListener);

	const audioLoader = new THREE.AudioLoader();

	for (let i = 1; i < 6; i++) {
		let mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(1, 12, 12),
		  new THREE.MeshBasicMaterial({ transparent: true })
		);
	
		let audioSource = new THREE.PositionalAudio(audioListener);

		//this bit isn't rendering anything.
		//maybe it's not really spatialized?
		// const helper = new PositionalAudioHelper( audioSource, 0.1 );
		// audioSource.add( helper );
	
		// load the audio file into the positional audio source
		audioLoader.load("audio/" + i + ".mp3", function (buffer) {
		  audioSource.setBuffer(buffer);
		  audioSource.setDistanceModel("exponential");
		  audioSource.setRefDistance(10);
		  audioSource.setRolloffFactor(3);
		  //audioSource.setDirectionalCone( 180, 230, 0.1 );
		  audioSource.setLoop(true);
		  audioSource.play();
		});
	
		mesh.add(audioSource);
		scene.add(mesh);
	
		audioSources.push(mesh);
	  }
	  //placing all the audiosources where they're meant to be in our scene
	//band goes in the basement - 0,-20,-10
	  audioSources[0].translateY(-20);
	  audioSources[0].translateZ(-5);

	  //audioSource 1 on top of "me" - 48,30,15
	  audioSources[1].translateX(48);
	  audioSources[1].translateY(30);
	  audioSources[1].translateZ(15);

	  //audioSource 2 is on the pot in the kitchen - 0,3,15
	  audioSources[4].translateY(3);
	  audioSources[4].translateZ(15);

	  //audioSource 4 on the couch - -5,48,0
	  audioSources[3].translateX(-5);
	  audioSources[3].translateY(48);

	  //audioSource2 up on the top of the stairs - 0 ,64, -30;
	  audioSources[2].translateY(64);
	  audioSources[2].translateZ(-30);
}



//DRAW FUNCTION
function draw() {
	requestAnimationFrame( draw );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update(clock.getDelta());
	composer.render();

	//working but also throwing errors. Why?
	pot.rotateY(0.01);
	pot.rotateX(0.005);
	//pot.rotateY(1);
	//renderer.render( scene, camera );	

}



function addBackground(){

	let backgroundColor = new THREE.Color(0xff00ff); // create a color representation from a hex code
	renderer.setClearColor(backgroundColor);

	let loader = new RGBELoader();
  loader.load("bg2.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;

	//VideoTexture.needsUpdate = true;
  });
}

init();