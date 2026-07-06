import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000010);
document.body.appendChild(renderer.domElement);

function createStarShape() {
    const shape = new THREE.Shape();
    const outer = 2.0;
    const inner = 0.4;
    const points = 4;

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    shape.closePath();
    return shape;
}

const starShape = createStarShape();
const starGeometry = new THREE.ShapeGeometry(starShape);

const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0xffd700) },
        uColor2: { value: new THREE.Color(0xff8c00) },
        uGlowIntensity: { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uGlowIntensity;
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);

            vec3 color = mix(uColor2, uColor1, dist * 2.0);

            float glow = exp(-dist * 3.0) * uGlowIntensity;
            float pulse = sin(uTime * 2.0) * 0.15 + 0.85;

            color += glow * vec3(1.0, 0.9, 0.7) * pulse;

            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha *= pulse;

            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide
});

const star = new THREE.Mesh(starGeometry, starMaterial);
scene.add(star);

const glowGeometry = new THREE.CircleGeometry(0.8, 32);
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);

            vec3 color = vec3(1.0, 1.0, 0.9);
            float glow = exp(-dist * 5.0);

            float pulse = sin(uTime * 3.0) * 0.2 + 0.8;

            float alpha = glow * pulse * 0.9;

            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
});

const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

const coreGeometry = new THREE.CircleGeometry(0.3, 32);
const coreMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);

            vec3 color = vec3(1.0, 1.0, 1.0);
            float core = 1.0 - smoothstep(0.0, 0.5, dist);

            float pulse = sin(uTime * 4.0) * 0.1 + 0.9;

            gl_FragColor = vec4(color, core * pulse);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
});

const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

camera.position.z = 10;

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    starMaterial.uniforms.uTime.value = elapsedTime;
    glowMaterial.uniforms.uTime.value = elapsedTime;
    coreMaterial.uniforms.uTime.value = elapsedTime;

    star.rotation.z += 0.002;

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
