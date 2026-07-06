import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000010);
document.body.appendChild(renderer.domElement);

function createStar() {
    const group = new THREE.Group();

    const rayShape = new THREE.Shape();
    rayShape.moveTo(0, 0);
    rayShape.lineTo(-0.08, 0.6);
    rayShape.lineTo(0, 2.5);
    rayShape.lineTo(0.08, 0.6);
    rayShape.closePath();

    const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });

    const angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
    angles.forEach(angle => {
        const ray = new THREE.Mesh(new THREE.ShapeGeometry(rayShape), rayMaterial);
        ray.rotation.z = angle;
        group.add(ray);
    });

    const diagonalRayShape = new THREE.Shape();
    diagonalRayShape.moveTo(0, 0);
    diagonalRayShape.lineTo(-0.04, 0.4);
    diagonalRayShape.lineTo(0, 1.8);
    diagonalRayShape.lineTo(0.04, 0.4);
    diagonalRayShape.closePath();

    const diagonalRayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });

    const diagonalAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    diagonalAngles.forEach(angle => {
        const ray = new THREE.Mesh(new THREE.ShapeGeometry(diagonalRayShape), diagonalRayMaterial);
        ray.rotation.z = angle;
        group.add(ray);
    });

    const coreGeometry = new THREE.CircleGeometry(0.5, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const innerGlowGeometry = new THREE.CircleGeometry(0.8, 32);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.6 });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    group.add(innerGlow);

    const outerGlowGeometry = new THREE.CircleGeometry(1.5, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.2 });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    group.add(outerGlow);

    const haloGeometry = new THREE.RingGeometry(0.5, 2.0, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    group.add(halo);

    return group;
}

const star = createStar();
scene.add(star);

camera.position.z = 10;

let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.02;

    const pulse = Math.sin(time * 2) * 0.1 + 1.0;
    star.children[8].scale.set(pulse, pulse, 1);

    const rayPulse = Math.sin(time * 3) * 0.15 + 0.85;
    star.children.forEach((child, i) => {
        if (i < 8) {
            child.material.opacity = (i < 4 ? 0.9 : 0.7) * rayPulse;
        }
    });

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
