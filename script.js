import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000020);
document.body.appendChild(renderer.domElement);

const starShape = new THREE.Shape();
const outer = 2.0;
const inner = 0.5;

const angles = [
    { r: outer, a: Math.PI / 2 },
    { r: inner, a: Math.PI / 4 },
    { r: outer, a: 0 },
    { r: inner, a: -Math.PI / 4 },
    { r: outer, a: -Math.PI / 2 },
    { r: inner, a: -3 * Math.PI / 4 },
    { r: outer, a: Math.PI },
    { r: inner, a: 3 * Math.PI / 4 }
];

starShape.moveTo(Math.cos(angles[0].a) * angles[0].r, Math.sin(angles[0].a) * angles[0].r);
for (let i = 1; i < angles.length; i++) {
    starShape.lineTo(Math.cos(angles[i].a) * angles[i].r, Math.sin(angles[i].a) * angles[i].r);
}
starShape.closePath();

const starGeometry = new THREE.ShapeGeometry(starShape);
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
const star = new THREE.Mesh(starGeometry, starMaterial);
scene.add(star);

const glowGeometry = new THREE.CircleGeometry(0.6, 32);
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

camera.position.z = 10;

function animate() {
    requestAnimationFrame(animate);
    star.rotation.z += 0.005;
    glow.rotation.z -= 0.01;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -5 * aspect;
    camera.right = 5 * aspect;
    camera.top = 5;
    camera.bottom = -5;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
