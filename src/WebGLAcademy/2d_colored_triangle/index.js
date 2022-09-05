'use strict'

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl', { antialias: true })

if (!gl) {
  throw new Error('WebGL is not supported')
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d'])

const _color = gl.getAttribLocation(program, 'color')
const _position = gl.getAttribLocation(program, 'position')

gl.enableVertexAttribArray(_color)
gl.enableVertexAttribArray(_position)

gl.useProgram(program)

// == TRIANGLE == //
// POINTS
const triangle_vertex = [
  // 0 index
  -1, -1, // position. first corner, bottom left (x, y)
  0, 0, 1, // color. blue

  // 1 index
  1, -1, // position. bottom right of the viewport (x, y)
  0, 1, 0, // color. red + green

  // 2 index
  1, 1, // position. top right of the viewport (x, y)
  1, 0, 0, // color. red

  // 3 index
  -1, 1, // position. top left of the viewport (x, y)
  0, 1, 0, // color red + green

  // 4 index
  1, 1, // position. top right of the viewport (x, y)
  1, 0, 0, // color. red

  // 5 index
  -1, -1, // position. first corner, bottom left (x,y)
  0, 0, 1, // color blue
]
const TRIANGLE_VERTEX = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW)

// FACES
const triangle_faces = [0, 1, 2, 3, 4, 5]
const TRIANGLE_FACES = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_faces), gl.STATIC_DRAW)

// == DRAWING == //
gl.clearColor(0.0, 0.0, 0.0, 0.0)

const animate = () => {
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX)

  gl.vertexAttribPointer(_position, 2, gl.FLOAT, false, 4 * (2 + 3), 0)
  gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 4 * (2 + 3), 2 * 4)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  gl.flush()

  requestAnimationFrame(animate)
}

animate()