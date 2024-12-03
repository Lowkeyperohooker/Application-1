// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// Used for creating complex animations and transitions
import gsap from "https://cdn.skypack.dev/gsap@3.12.5";
// Lightweight GUI for web development
import * as dat from "https://cdn.skypack.dev/lil-gui@0.16.0";
// import * as THREE from 'three';
// import { OrbitControls } from "three/examples/jsm/Addons.js";
// import gsap from "gsap";
// import * as dat from 'lil-gui';
// import Material2080 from './Wood_027_height.png';
// import AmbientOcclusion from '/Wood_027_ambientOcclusion.jpg';
// import baseColor from '/Wood_027_basecolor.jpg';
// import from 

// console.log(Material2080);

const parameters = {
  color: 0xff0000,
  spin: () => {
    isRotating = !isRotating;
  }
};

let isRotating = true;

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene 
const scene = new THREE.Scene();

// Group
const group = new THREE.Group();
scene.add(group);

// // Image 1
// const imageHeight = new Image();
// const texture = new THREE.Texture(imageHeight);
// imageHeight.addEventListener('load', () => {
//   console.log('Image loaded successfully!');
//   texture.needsUpdate = true;
// });
// imageHeight.src = './Wood_027_height.png';

// Image 2
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () =>{
  console.log('loading started');
};
loadingManager.onLoad = () => {
  console.log('loading finished');
};
loadingManager.onProgress = () => {
  console.log('loading progressing');
};
loadingManager.onError = () => {
  console.log('loading error');
};

const textureLoader = new THREE.TextureLoader(loadingManager);
const normalTexture = textureLoader.load('./Wood_027_normal.jpg');
const ambientOcclusionTexture = textureLoader.load('./Wood_027_ambientOcclusion.jpg');
const baseColorTexture = textureLoader.load('./Wood_027_basecolor.jpg');
const heightTexture = textureLoader.load('./Wood_027_height.png');
const roughnessTexture = textureLoader.load('./Wood_027_roughness.jpg');

// Material
const material = new THREE.MeshStandardMaterial({
  map: baseColorTexture, // Base color map
  normalMap: normalTexture, // Normal map
  roughnessMap: roughnessTexture, // Roughness map
  aoMap: ambientOcclusionTexture, // Ambient occlusion map
  displacementMap: heightTexture, // Height map
  displacementScale: 0.1 // Adjust to control displacement intensity
});

// Object 
const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
console.log(boxGeometry.attributes.uv);
// Ensure UV mapping is enabled for ambient occlusion
boxGeometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(boxGeometry.attributes.uv.array, 2)
);

const cube =  new THREE.Mesh(boxGeometry, material);
cube.position.x = 0;
group.add(cube);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  material
);
sphere.position.x = 1.5;
group.add(sphere);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 16, 32),
  material
);
torus.position.x = -1.5;
group.add(torus);

// Floor Geometry and Material
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080, // Grey color
  roughness: 0.8, // High roughness for a matte look
  metalness: 0.1, // Slight metallic look
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to lie flat
floor.position.y = -0.5; // Position slightly below the group
scene.add(floor);


// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Strong light
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);


// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 1000);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// Shadow
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;
cube.castShadow = true;
sphere.castShadow = true;
torus.castShadow = true;
floor.receiveShadow = true;


// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Debug
 */
const gui = new dat.GUI();
// gui.add(cube.position, 'y', -3, 3, 0.01);
gui
  .add(group.position, 'y')
  .min(-3)
  .max(3)
  .step(0.01)
  .name('elevation')
  .onChange((value) => {
    // Adjust the floor's position to follow the group
    floor.position.y = value - 0.5; // Offset to keep the floor slightly below the group
  });

gui.add(group, 'visible');

gui.add(material, 'wireframe');

gui.add(material, 'metalness')
  .min(0)
  .max(1)
  .step(0.0001);
  
gui.add(material, 'roughness')
.min(0)
.max(1)
.step(0.0001);

gui.add(parameters, 'spin').name('Rotation');

// Mouse movement
let isMouseDown = false; // Flag to track mouse state
let previousMousePosition = { x: 0, y: 0 }; 

// Store the last mouse position

// Mouse Down Event
window.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
});

// Mouse Up Event
window.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// Mouse Move Event
window.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    // Adjust the camera position or rotation
    camera.position.x -= deltaX * 0.01; // Adjust the multiplier to control sensitivity
    camera.position.y += deltaY * 0.01;

    // Update the previous mouse position
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }
});

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;

  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

window.addEventListener('dblclick', () => {
  if(!document.fullscreenElement) {
    if(canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if(canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
    
  } else {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    
  }
});

const tick = () => {
  if(isRotating){
    group.rotation.y += 0.01;
  }
  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
}

tick();
 