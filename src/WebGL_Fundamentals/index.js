const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  throw new Error('WebGL is not supported')
}

resizeCanvasToDisplaySize(canvas);

const vertexShader = createVertexShader('vertex-shader-2d');
const fragmentShader = createFragmentShader('fragment-shader-2d');
const program = createProgram(gl, vertexShader, fragmentShader);

const positions = [
  0, 0,
  0, 0.5,
  0.7, 0,
]

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
const positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
gl.clearColor(0, 0, 0, 0)
gl.clear(gl.COLOR_BUFFER_BIT)

gl.useProgram(program)
gl.enableVertexAttribArray(positionAttributeLocation)
















// == FUNCTIONS == //
/**
 *
 * Creates shader from script element by id
 * @param gl {WebGLRenderingContext}
 * @param type {GLenum}
 * @param sourceId {string}
 * @returns {WebGLShader}
 */
function createShader(gl, type, sourceId) {
  const source = document.getElementById(sourceId).text;
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

/**
 * Creates vertex shader from script element by id
 * @param sourceId {string}
 * @returns {WebGLShader}
 */
function createVertexShader(sourceId) {
 return createShader.call(this, gl, gl.VERTEX_SHADER, sourceId);
}

/**
 * Creates fragment shader from script element by id
 * @param sourceId {string}
 * @returns {WebGLShader}
 */
function createFragmentShader(sourceId) {
  return createShader.call(this, gl, gl.FRAGMENT_SHADER, sourceId);
}

/**
 * Links 2 shaders to program.
 * @param gl {WebGLRenderingContext}
 * @param vertexShader {WebGLShader}
 * @param fragmentShader {WebGLShader}
 */
function createProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

/**
 * Resizes canvas to display size
 * @param canvas {HTMLCanvasElement}
 * @returns {boolean}
 */
function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}