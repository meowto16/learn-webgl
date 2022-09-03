'use strict'

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl', { antialias: true })

if (!gl) {
  throw new Error('WebGL is not supported')
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d'])

const _Pmatrix = gl.getUniformLocation(program, 'Pmatrix')
const _Mmatrix = gl.getUniformLocation(program, 'Mmatrix')
const _Vmatrix = gl.getUniformLocation(program, 'Vmatrix')

const _color = gl.getAttribLocation(program, 'color')
const _position = gl.getAttribLocation(program, 'position')

gl.enableVertexAttribArray(_color)
gl.enableVertexAttribArray(_position)

gl.useProgram(program)

// == CUBE == //
// POINTS
const cone_vertex = [
  // Bottom side (square, 2 triangles).
  -1, -1,  1,   1, 1, 1, // left - down - front corner | color: white
   1, -1,  1,   1, 1, 1, // right - down - front corner | color: white
   1, -1, -1,   1, 1, 1, // right - down - back corner | color: white
  -1, -1, -1,   1, 1, 1, // left - down - back corner | color: white

  // Front side
   0,  0, 0,    1, 0, 0, // Top-middle | color: red
  -1, -1, 1,    1, 0, 0, // left - down - front corner | color: red
   1, -1, 1,    1, 0, 0, // right - down - front corner | color: red

  // Back side
   0,  0, 0,    1, 1, 0, // Top-middle | color: yellow
  -1, -1, -1,   1, 1, 0, // left - down - back corner | color: yellow
   1, -1, -1,   1, 1, 0, // right - down - back corner | color: yellow

  // Left side
  0,  0,   0,   0, 1, 0, // Top-middle | color: green
  -1, -1,  1,   0, 1, 0, // left - down - front corner | color: green
  -1, -1, -1,   0, 1, 0, // left - down - back corner | color: green

  // Right side
  0,  0,  0,    1, 0, 1, // Top-middle | color: purple
  1, -1,  1,    1, 0, 1, // right - down - front corner | color: purple
  1, -1, -1,    1, 0, 1, // right - down - back corner | color: purple
]
const CUBE_VERTEX = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, CUBE_VERTEX)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cone_vertex), gl.STATIC_DRAW)

// FACES
const cone_faces = [
  // Bottom side (square. 2 triangles)
  0, 1, 2,
  0, 2, 3,

  // Front triangle
  4, 5, 6,

  // Back triangle
  7, 8, 9,

  // Left triangle
  10, 11, 12,

  // Right triangle
  13, 14, 15
]
const CONE_FACES = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CONE_FACES)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cone_faces), gl.STATIC_DRAW)

// == MATRIX == //
// We modelize 4x4 matrix by a 1 dimension JS array with 16 floats.
// Operations are faster than with 2 dimensional arrays, and we can send it directly to WebGL
const PROJECTION_MATRIX = LIBS.get_projection(40, canvas.width / canvas.height, 1, 100)

// It is a cone movement matrix
const MOVE_MATRIX = LIBS.get_I4()
const VIEW_MATRIX = LIBS.get_I4()

LIBS.translateZ(VIEW_MATRIX, -10);

// == DRAWING == //
gl.clearColor(0.0, 0.0, 0.0, 0.0)

// Enables "depth buffer" capability
// - The "depth buffer" is buffer, which has the size of the viewport
// - For each pixel it stores distance between the pixel and the camera
// - This distance is normalized between -1 and 1
// - Before rendering a pixel in the fragment shader, webgl looks the value of the depth buffer at this position
// - If this value is lower than the pixel depth buffer, webgl skips rendering
//   (because there is a pixel in front of the current pixel)
// - After drawing a pixel, "depth buffer" is automatically refreshed.
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

gl.clearDepth(1.0);


let time_prev = 0
const animate = (time) => {
  const diff = (time - time_prev)

  // To rotate point or a vector, we have to
  // LIBS.rotateZ(MOVE_MATRIX, 0.001 * diff)
  // LIBS.rotateX(MOVE_MATRIX, 0.004 * diff)
  LIBS.rotateY(MOVE_MATRIX, 0.002 * diff)
  // LIBS.translateX(MOVE_MATRIX, 0.0008 * diff)
  // LIBS.rotateX(MOVE_MATRIX, 0.002 * diff)
  time_prev = time

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // The projection matrix P transforms 3D view coordinates A into clipping coordinates A'.
  // We have: A' = P.A
  //
  // 3D View Coordinates - coordinates in the view reference (X, Y, Z)
  // - X - goes from left to right
  // - Y - goes from down to up
  // - Z - goes from front to back
  //
  // Clipping coordinates - 4 components coordinates (x, y, z, w)
  // They are given to WebGL into the vertex shader with the pre-built variable gl_Position
  //
  // Device Normalized Coordinates:
  // Clipping coordinates are transformed into device normalized coordinates:
  // - Xn = x / w
  // - Yn = y / w
  // - Zn = z / w
  // The pixel is displayed at position (Xn, Yn). Zn is used for depth buffer,
  // to not redraw a pixel if the current pixel is nearest from the camera point.
  // (Xn, Yn, Zn) are between 1 and -1.
  // Example:
  // - (Xn = -1, Yn = -1) bottom left corner
  // - (Xn = 1, Yn = 1) - upper right corner
  gl.uniformMatrix4fv(_Pmatrix, false, PROJECTION_MATRIX)
  gl.uniformMatrix4fv(_Vmatrix, false, VIEW_MATRIX);
  gl.uniformMatrix4fv(_Mmatrix, false, MOVE_MATRIX)

  gl.bindBuffer(gl.ARRAY_BUFFER, CUBE_VERTEX)

  gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 4 * (3 + 3), 0)
  gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 4 * (3 + 3), 3 * 4)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CONE_FACES)
  gl.drawElements(gl.TRIANGLES, 6 + (3 * 4), gl.UNSIGNED_SHORT, 0)
  gl.flush()

  requestAnimationFrame(animate)
}

animate(0)