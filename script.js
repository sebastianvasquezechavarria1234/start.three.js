import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

const renderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
});

const renderTarget2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
});

let currentTarget = renderTarget1;
let previousTarget = renderTarget2;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

#define twopi 6.28319
#define nb_particles 100

uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iChannel0;

varying vec2 vUv;

const float start_time = 1.5;
const float time_factor = 0.5;
const float gen_scale = 1.;

const vec2 middlepoint = vec2(0.5, 0.5);
const vec3 main_x_freq = vec3(1.3, 0.7, 2.1);
const vec3 main_x_amp = vec3(0.15, 0.1, 0.05);
const vec3 main_x_phase = vec3(0., 120., 240.);
const vec3 main_y_freq = vec3(0.9, 1.5, 1.8);
const vec3 main_y_amp = vec3(0.1, 0.12, 0.03);
const vec3 main_y_phase = vec3(60., 180., 300.);

const float part_timefact_min = 0.6;
const float part_timefact_max = 1.4;
const float part_life_time_min = 2.5;
const float part_life_time_max = 5.;
const float part_max_mov = 0.08;
const vec2 gravitation = vec2(0., -0.25);

const float dist_factor = 350.;
const float ppow = 0.7;
const float part_int_div = 2.2;
const float part_int_factor_min = 0.5;
const float part_int_factor_max = 1.5;
const float mp_int = 1.5;
const float mp_saturation = 0.08;
const float mp_hue = 0.;

const float part_min_hue = 0.55;
const float part_max_hue = 0.75;
const float hue_time_factor = 0.02;
const float part_min_saturation = 0.4;
const float part_max_saturation = 0.8;

const float grow_time_factor = 0.15;
const float part_spark_time_freq_fact = 0.4;
const float part_spark_min_freq = 4.;
const float part_spark_max_freq = 12.;
const float part_spark_min_int = 0.7;
const float part_spark_max_int = 1.3;

const vec2 part_starhv_dfac = vec2(10., 0.37);
const float part_starhv_ifac = 0.32;
const vec2 part_stardiag_dfac = vec2(13., 0.61);
const float part_stardiag_ifac = 0.19;
const float mb_factor = 0.73;

float pst;
float plt;
float runnr;
float time2;
float time3;
float time4;

vec3 hsv2rgb(vec3 hsv) {
  hsv.yz = clamp(hsv.yz, 0.0, 1.0);
  return hsv.z * (0.63 * hsv.y * (cos(twopi * (hsv.x + vec3(0.0, 2.0/3.0, 1.0/3.0))) - 1.0) + 1.0);
}

float random(float co) {
  return fract(sin(co * 12.989) * 43758.545);
}

float getParticleStartTime(int partnr) {
  return start_time * random(float(partnr * 2));
}

float harms(vec3 freq, vec3 amp, vec3 phase, float time) {
  float val = 0.;
  for (int h = 0; h < 3; h++)
    val += amp[h] * cos(time * freq[h] * twopi + phase[h] / 360. * twopi);
  return (1. + val) / 2.;
}

vec2 getParticlePosition(int partnr) {
  float part_timefact = mix(part_timefact_min, part_timefact_max, random(float(partnr * 2 + 94) + runnr * 1.5));
  float ptime = (runnr * plt + pst) * (-1./part_timefact + 1.) + time2/part_timefact;

  vec2 ppos = vec2(harms(main_x_freq, main_x_amp, main_x_phase, ptime), harms(main_y_freq, main_y_amp, main_y_phase, ptime)) + middlepoint;

  vec2 delta_pos = part_max_mov * (vec2(random(float(partnr * 3 - 23) + runnr * 4.), random(float(partnr * 7 + 632) - runnr * 2.5)) - 0.5) * (time3 - pst);

  vec2 grav_pos = gravitation * pow(time4, 2.) / 250.;
  return (ppos + delta_pos + grav_pos) * gen_scale;
}

vec2 getParticlePosition_mp() {
  vec2 ppos = vec2(harms(main_x_freq, main_x_amp, main_x_phase, time2), harms(main_y_freq, main_y_amp, main_y_phase, time2)) + middlepoint;
  return gen_scale * ppos;
}

vec3 getParticleColor(int partnr, float pint) {
  float hue;
  float saturation;
  saturation = mix(part_min_saturation, part_max_saturation, random(float(partnr * 6 + 44) + runnr * 3.3)) * 0.45/pint;
  hue = mix(part_min_hue, part_max_hue, random(float(partnr + 124) + runnr * 1.5)) + hue_time_factor * time2;

  return hsv2rgb(vec3(hue, saturation, pint));
}

vec3 getParticleColor_mp(float pint) {
  float hue;
  float saturation;

  saturation = 0.75/pow(pint, 2.5) + mp_saturation;
  hue = hue_time_factor * time2 + mp_hue;
  return hsv2rgb(vec3(hue, saturation, pint));
}

vec3 drawParticles(vec2 uv, float timedelta) {
  time2 = time_factor * (iTime + timedelta);
  vec3 pcol = vec3(0.);

  for (int i = 1; i < nb_particles; i++) {
    pst = getParticleStartTime(i);
    plt = mix(part_life_time_min, part_life_time_max, random(float(i * 2 - 35)));
    time4 = mod(time2 - pst, plt);
    time3 = time4 + pst;

    runnr = floor((time2 - pst)/plt);

    vec2 ppos = getParticlePosition(i);
    float dist = distance(uv, ppos);

    vec2 uvppos = uv - ppos;
    float distv = distance(uvppos * part_starhv_dfac + ppos, ppos);
    float disth = distance(uvppos * part_starhv_dfac.yx + ppos, ppos);

    vec2 uvpposd = 0.707 * vec2(dot(uvppos, vec2(1., 1.)), dot(uvppos, vec2(1., -1.)));
    float distd1 = distance(uvpposd * part_stardiag_dfac + ppos, ppos);
    float distd2 = distance(uvpposd * part_stardiag_dfac.yx + ppos, ppos);

    float pint0 = mix(part_int_factor_min, part_int_factor_max, random(runnr * 4. + float(i - 55)));

    float pint1 = 1./(dist * dist_factor + 0.015) + part_starhv_ifac/(disth * dist_factor + 0.01) + part_starhv_ifac/(distv * dist_factor + 0.01) + part_stardiag_ifac/(distd1 * dist_factor + 0.01) + part_stardiag_ifac/(distd2 * dist_factor + 0.01);

    float pint = pint0 * (pow(pint1, ppow)/part_int_div) * (-time4/plt + 1.);

    pint *= smoothstep(0., grow_time_factor * plt, time4);

    float sparkfreq = clamp(part_spark_time_freq_fact * time4, 0., 1.) * part_spark_min_freq + random(float(i * 5 + 72) - runnr * 1.8) * (part_spark_max_freq - part_spark_min_freq);
    pint *= mix(part_spark_min_int, part_spark_max_int, random(float(i * 7 - 621) - runnr * 12.)) * sin(sparkfreq * twopi * time2) / 2. + 1.;

    pcol += getParticleColor(i, pint);
  }

  vec2 ppos = getParticlePosition_mp();
  float dist = distance(uv, ppos);

  vec2 uvppos = uv - ppos;
  float distv = distance(uvppos * part_starhv_dfac + ppos, ppos);
  float disth = distance(uvppos * part_starhv_dfac.yx + ppos, ppos);

  vec2 uvpposd = 0.7071 * vec2(dot(uvppos, vec2(1., 1.)), dot(uvppos, vec2(1., -1.)));
  float distd1 = distance(uvpposd * part_stardiag_dfac + ppos, ppos);
  float distd2 = distance(uvpposd * part_stardiag_dfac.yx + ppos, ppos);

  float pint1 = 1./(dist * dist_factor + 0.015) + part_starhv_ifac/(disth * dist_factor + 0.01) + part_starhv_ifac/(distv * dist_factor + 0.01) + part_stardiag_ifac/(distd1 * dist_factor + 0.01) + part_stardiag_ifac/(distd2 * dist_factor + 0.01);

  if (part_int_factor_max * pint1 > 6.) {
    float pint = part_int_factor_max * (pow(pint1, ppow)/part_int_div) * mp_int;
    pcol += getParticleColor_mp(pint);
  }

  return pcol;
}

void main() {
  vec2 uv = vUv;
  vec2 uv2 = vUv;
  vec3 pcolor = texture2D(iChannel0, uv2).rgb * mb_factor;

  pcolor += drawParticles(uv, 0.) * 0.9;

  gl_FragColor = vec4(pcolor, 1.0);
}
`;

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iChannel0: { value: null }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), particleMaterial);
scene.add(quad);

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  particleMaterial.uniforms.iTime.value = time;
  particleMaterial.uniforms.iChannel0.value = previousTarget.texture;

  renderer.setRenderTarget(currentTarget);
  renderer.render(scene, camera);

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  const temp = currentTarget;
  currentTarget = previousTarget;
  previousTarget = temp;
}

animate();

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  particleMaterial.uniforms.iResolution.value.set(width, height);

  renderTarget1.setSize(width, height);
  renderTarget2.setSize(width, height);
});
