'use strict'

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  throw new Error('WebGL is not supported')
}

// Compile shaders and link into program.
// The program is a vertex and fragment shader paired together.
// A vertex shader job is to compute position. Based on positions WebGL can rasterize points, lines and triangles.
// A fragment shader job is to compute color for each pixel of the primitive currently being drawn.
const program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d'])

/**
 * Look up where the vertex data needs to go.
 * Attribute - used to specify how to pull data out of buffers
 * and provide them to vertex shader.
 *
 * - Which buffer to pull the positions out of
 * - What type of data it should pull out
 * - What offset in the buffer the positions start
 * - How many bytes to get from one position to the next
 */
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

/**
 * Look up uniform locations.
 * Uniforms - global variables
 * You are setting it before your program execution.
 */
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')

/**
 * Create a buffer to put three 2d clip space points in
 */
const positionBuffer = gl.createBuffer()

/**
 * Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
 * gl.ARRAY_BUFFER - Buffer containing vertex attributes, such as vertex coordinates,
 * texture coordinate data, or vertex color data
 */
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

const positions = [
  10, 20,
  80, 20,
  10, 30,
  10, 30,
  80, 20,
  80, 30,
]

/**
 * Float32Array - typed array, represents an array of 32-bit floating point numbers
 * gl.STATIC_DRAW - The contents are intended to be specified once by the application,
 * and used many times as the source for WebGL drawing and image specification commands.
 */
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

webglUtils.resizeCanvasToDisplaySize(gl.canvas);

// Tell WebGL how to convert from clip space to pixels
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Tell it to use our program (pair of shaders)
gl.useProgram(program);

// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Bind the position buffer.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
(() => {
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);
})();

// set the resolution
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

// draw
(() => {
  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);
})();