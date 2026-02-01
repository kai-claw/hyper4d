// 4D Mathematics Engine

export type Vec4 = [number, number, number, number];
export type Mat4x4 = [Vec4, Vec4, Vec4, Vec4];
export type Vec3 = [number, number, number];

// === Vector operations ===

export function vec4(x: number, y: number, z: number, w: number): Vec4 {
  return [x, y, z, w];
}

export function add4(a: Vec4, b: Vec4): Vec4 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

export function sub4(a: Vec4, b: Vec4): Vec4 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
}

export function scale4(v: Vec4, s: number): Vec4 {
  return [v[0] * s, v[1] * s, v[2] * s, v[3] * s];
}

export function dot4(a: Vec4, b: Vec4): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function length4(v: Vec4): number {
  return Math.sqrt(dot4(v, v));
}

export function normalize4(v: Vec4): Vec4 {
  const len = length4(v);
  if (len === 0) return [0, 0, 0, 0];
  return scale4(v, 1 / len);
}

export function lerp4(a: Vec4, b: Vec4, t: number): Vec4 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ];
}

// === Matrix operations ===

export function identity4(): Mat4x4 {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

export function mulMat4(a: Mat4x4, b: Mat4x4): Mat4x4 {
  const result: Mat4x4 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

export function mulMatVec4(m: Mat4x4, v: Vec4): Vec4 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2] + m[0][3] * v[3],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2] + m[1][3] * v[3],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2] + m[2][3] * v[3],
    m[3][0] * v[0] + m[3][1] * v[1] + m[3][2] * v[2] + m[3][3] * v[3],
  ];
}

// === 4D Rotation matrices ===
// In 4D there are 6 planes of rotation: XY, XZ, XW, YZ, YW, ZW

export function rotateXY(angle: number): Mat4x4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [c, -s, 0, 0],
    [s, c, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

export function rotateXZ(angle: number): Mat4x4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [c, 0, -s, 0],
    [0, 1, 0, 0],
    [s, 0, c, 0],
    [0, 0, 0, 1],
  ];
}

export function rotateXW(angle: number): Mat4x4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [c, 0, 0, -s],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [s, 0, 0, c],
  ];
}

export function rotateYZ(angle: number): Mat4x4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1],
  ];
}

export function rotateYW(angle: number): Mat4x4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [1, 0, 0, 0],
    [0, c, 0, -s],
    [0, 0, 1, 0],
    [0, s, 0, c],
  ];
}

export function rotateZW(angle: number): Mat4x4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, c, -s],
    [0, 0, s, c],
  ];
}

// === Projection: 4D → 3D ===

/**
 * Perspective projection from 4D to 3D space.
 * 
 * This function simulates a 4D camera looking at a 4D object from a distance
 * along the W axis, similar to how a 3D camera projects 3D objects to 2D.
 * Objects farther in W appear smaller, closer objects appear larger.
 * 
 * @param point - The 4D point to project [x, y, z, w]
 * @param viewDistance - Distance of the 4D camera along the W axis
 * @returns Projected 3D point [x', y', z']
 */
export function projectPerspective4Dto3D(
  point: Vec4,
  viewDistance: number = 3
): Vec3 {
  const w = viewDistance - point[3];
  if (Math.abs(w) < 0.0001) return [point[0] * 1000, point[1] * 1000, point[2] * 1000];
  const scale = viewDistance / w;
  return [point[0] * scale, point[1] * scale, point[2] * scale];
}

// Orthographic projection — just drop the W coordinate
export function projectOrthographic4Dto3D(point: Vec4): Vec3 {
  return [point[0], point[1], point[2]];
}

// Stereographic projection for smooth, conformal mapping
export function projectStereographic4Dto3D(
  point: Vec4,
  projectionPoint: number = 2
): Vec3 {
  const denom = projectionPoint - point[3];
  if (Math.abs(denom) < 0.0001) return [point[0] * 1000, point[1] * 1000, point[2] * 1000];
  return [
    point[0] / denom,
    point[1] / denom,
    point[2] / denom,
  ];
}

// Compose multiple rotation matrices
export function composeRotations(...matrices: Mat4x4[]): Mat4x4 {
  return matrices.reduce((acc, m) => mulMat4(acc, m), identity4());
}
