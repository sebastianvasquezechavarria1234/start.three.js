import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111);
document.body.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(8, 8);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const starGroup = new THREE.Group();

function createRay(length, width) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-width, length * 0.3);
    shape.lineTo(0, length);
    shape.lineTo(width, length * 0.3);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
}

const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });

const ray1 = new THREE.Mesh(createRay(2.5, 0.1), rayMaterial);
ray1.position.y = 0;
starGroup.add(ray1);

const ray2 = new THREE.Mesh(createRay(2.5, 0.1), rayMaterial);
ray2.rotation.z = Math.PI;
ray2.position.y = 0;
starGroup.add(ray2);

const ray3 = new THREE.Mesh(createRay(2.5, 0.1), rayMaterial);
ray3.rotation.z = Math.PI / 2;
ray3.position.x = 0;
starGroup.add(ray3);

const ray4 = new THREE.Mesh(createRay(2.5, 0.1), rayMaterial);
ray4.rotation.z = -Math.PI / 2;
ray4.position.x = 0;
starGroup.add(ray4);

const smallRayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

const dr1 = new THREE.Mesh(createRay(1.5, 0.05), smallRayMaterial);
dr1.rotation.z = Math.PI / 4;
starGroup.add(dr1);

const dr2 = new THREE.Mesh(createRay(1.5, 0.05), smallRayMaterial);
dr2.rotation.z = 3 * Math.PI / 4;
starGroup.add(dr2);

const dr3 = new THREE.Mesh(createRay(1.5, 0.05), smallRayMaterial);
dr3.rotation.z = 5 * Math.PI / 4;
starGroup.add(dr3);

const dr4 = new THREE.Mesh(createRay(1.5, 0.05), smallRayMaterial);
dr4.rotation.z = 7 * Math.PI / 4;
starGroup.add(dr4);

const coreGeometry = new THREE.CircleGeometry(0.4, 32);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
starGroup.add(core);

const glowGeometry = new THREE.CircleGeometry(0.7, 32);
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.5 });
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
starGroup.add(glow);

const outerGlowGeometry = new THREE.CircleGeometry(1.2, 32);
const outerGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.2 });
const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
starGroup.add(outerGlow);

starGroup.position.z = 0.01;
scene.add(starGroup);

camera.position.z = 10;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.02;

    const pulse = Math.sin(time * 2) * 0.1 + 1.0;
    glow.scale.set(pulse, pulse, 1);

    const rayPulse = Math.sin(time * 3) * 0.15 + 0.85;
    starGroup.children.forEach((child, i) => {
        if (i < 8) {
            child.material.opacity = (i < 4 ? 0.9 : 0.6) * rayPulse;
        }
    });

    renderer.render(scene, camera);
    controls.update();
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
