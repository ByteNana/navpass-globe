import * as THREE from 'three';
import { latLongToVector3 } from './latLongtoVector3';
import vertexShader from '../shaders/points.vert?raw';
import fragmentShader from '../shaders/points.frag?raw';
import { GOOGLE_COLORS } from '../theme/googleColors';

export function createLanguagePoints(data: any[], radius: number) {
  const geometry = new THREE.BufferGeometry();

  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const seeds: number[] = [];

  const color = new THREE.Color();

  for (const lang of data) {
    const lat = Number(lang.latitude);
    const lng = Number(lang.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.warn('Ponto inválido:', lang);
      continue;
    }

    const v = latLongToVector3(lat, lng, radius * 1.01);

    positions.push(v.x, v.y, v.z);

    color.copy(GOOGLE_COLORS.white);
    colors.push(color.r, color.g, color.b);

    // Smaller airport dots (closer to Google's subtle star-like points).
    sizes.push(Math.random() * 0.42 + 0.48);
    seeds.push(Math.random());
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  );
  geometry.setAttribute(
    'size',
    new THREE.Float32BufferAttribute(sizes, 1)
  );
  geometry.setAttribute(
    'aSeed',
    new THREE.Float32BufferAttribute(seeds, 1)
  );

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    depthTest: true,
    uniforms: {
      uTime: { value: 0 },
      uCameraDistance: { value: 0 },
      uColorMul: { value: new THREE.Color(1, 1, 1) },
      uAlphaMul: { value: 0.82 }
    }
  });


  const points = new THREE.Points(geometry, material);
  points.renderOrder = 4
  points.frustumCulled = false

  return { points, material };
}
