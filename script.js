import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const NB_PARTICLES = 150;
const positions = new Float32Array(NB_PARTICLES * 3);
const randoms = new Float32Array(NB_PARTICLES * 4);
const sizes = new Float32Array(NB_PARTICLES);

for (let i = 0; i < NB_PARTICLES; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

  randoms[i * 4] = Math.random();
  randoms[i * 4 + 1] = Math.random();
  randoms[i * 4 + 2] = Math.random();
  randoms[i * 4 + 3] = Math.random();

  sizes[i] = Math.random() * 40 + 20;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 4));
geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

const vertexShader = `
uniform float uTime;
uniform vec2 uResolution;
attribute vec4 aRandom;
attribute float aSize;
varying vec4 vRandom;
varying float vSize;

void main() {
  vRandom = aRandom;
  vSize = aSize;

  vec3 pos = position;

  pos.y += sin(uTime * 0.5 + position.x * 0.1) * 1.0;
  pos.x += cos(uTime * 0.3 + position.y * 0.1) * 0.8;
  pos.z += sin(uTime * 0.2 + position.z * 0.1) * 0.9;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aSize * (300.0 / -mvPosition.z);
}
`;

const fragmentShader = `
precision highp float;

#define twopi 6.28319

uniform float uTime;
uniform vec2 uResolution;

varying vec4 vRandom;
varying float vSize;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  float disth = distance(center * vec2(8.0, 0.4), vec2(0.0));
  float distv = distance(center * vec2(0.4, 8.0), vec2(0.0));

  vec2 centerDiag = 0.707 * vec2(dot(center, vec2(1.0, 1.0)), dot(center, vec2(1.0, -1.0)));
  float distd1 = distance(centerDiag * vec2(10.0, 0.6), vec2(0.0));
  float distd2 = distance(centerDiag * vec2(0.6, 10.0), vec2(0.0));

  float starIntensity = 1.0/(dist * 200.0 + 0.02)
                      + 0.5/(disth * 250.0 + 0.005)
                      + 0.5/(distv * 250.0 + 0.005)
                      + 0.35/(distd1 * 250.0 + 0.005)
                      + 0.35/(distd2 * 250.0 + 0.005);

  starIntensity = pow(starIntensity, 0.5) * 0.8;

  float rand = vRandom.x;
  vec3 baseColor;
  if (rand < 0.45) {
    baseColor = vec3(1.0, 1.0, 1.0);
  } else if (rand < 0.70) {
    baseColor = vec3(1.0, 0.96, 0.84);
  } else if (rand < 0.85) {
    baseColor = vec3(0.66, 0.84, 1.0);
  } else if (rand < 0.95) {
    baseColor = vec3(1.0, 0.71, 0.42);
  } else {
    baseColor = vec3(1.0, 0.48, 0.48);
  }

  float brightness = starIntensity * (0.5 + vRandom.z * 0.5);
  brightness *= 0.7 + 0.3 * sin(uTime * (4.0 + vRandom.w * 8.0) + vRandom.x * 6.28);

  vec3 color = baseColor * min(brightness, 1.0);

  float alpha = smoothstep(0.5, 0.08, dist) * min(brightness * 1.2, 1.0);

  gl_FragColor = vec4(color * 1.1, alpha);
}
`;

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  material.uniforms.uTime.value = time;

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});
