'use strict'

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl', { antialias: true })
const EXT = gl.getExtension('OES_element_index_uint')

if (!gl) {
  throw new Error('WebGL is not supported')
}

async function main() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

// == CAPTURE MOUSE EVENTS == //
  const rotating = captureMouseEvent('left-click', 2, 0.95)
  const translating = captureMouseEvent('right-click', 2, 0.95)

// == WEBGL START == //
  const program = webglUtils.createProgramFromScripts(gl, ['vertex-shader-2d', 'fragment-shader-2d'])

  const _Pmatrix = gl.getUniformLocation(program, 'Pmatrix')
  const _Mmatrix = gl.getUniformLocation(program, 'Mmatrix')
  const _Vmatrix = gl.getUniformLocation(program, 'Vmatrix')
  const _sampler = gl.getUniformLocation(program, 'sampler')

  const _position = gl.getAttribLocation(program, 'position')
  const _uv = gl.getAttribLocation(program, 'uv')

  gl.enableVertexAttribArray(_position)
  gl.enableVertexAttribArray(_uv)

  gl.useProgram(program)
  gl.uniform1i(_sampler, 0)

// Get json of dragon with vertices and indices
  const dragonJSON = await LIBS.getJson('resources/dragon.json')

// POINTS
  const DRAGON_VERTEX = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, DRAGON_VERTEX)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dragonJSON.vertices), gl.STATIC_DRAW)

// FACES
  const DRAGON_FACES = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, DRAGON_FACES)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(dragonJSON.indices), gl.STATIC_DRAW)

  const DRAGON_N_POINTS = dragonJSON.indices.length;

  const PROJECTION_MATRIX = LIBS.get_projection(40, canvas.width / canvas.height, 1, 100)
  const MOVE_MATRIX = LIBS.get_I4()
  const VIEW_MATRIX = LIBS.get_I4()

  LIBS.translateZ(VIEW_MATRIX, -20)
  LIBS.translateY(VIEW_MATRIX, -4)

  let dragon_texture = loadTexture('resources/dragon.png')

// == DRAWING == //
  gl.clearColor(0.0, 0.0, 0.0, 0.0)

  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.clearDepth(1.0)

  const animate = () => {
    LIBS.set_I4(MOVE_MATRIX)

    rotating.animateAmortization()
    translating.animateAmortization()

    LIBS.translateX(MOVE_MATRIX, translating.THETA)
    LIBS.translateY(MOVE_MATRIX, -translating.PHI)

    LIBS.rotateX(MOVE_MATRIX, rotating.THETA)
    LIBS.rotateY(MOVE_MATRIX, rotating.PHI)

    document.querySelector('#translating-phi .value').innerHTML = translating.PHI
    document.querySelector('#translating-theta .value').innerHTML = translating.THETA
    document.querySelector('#rotating-phi .value').innerHTML = rotating.PHI
    document.querySelector('#rotating-theta .value').innerHTML = rotating.THETA

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniformMatrix4fv(_Pmatrix, false, PROJECTION_MATRIX)
    gl.uniformMatrix4fv(_Vmatrix, false, VIEW_MATRIX)
    gl.uniformMatrix4fv(_Mmatrix, false, MOVE_MATRIX)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dragon_texture)

    gl.bindBuffer(gl.ARRAY_BUFFER, DRAGON_VERTEX)

    gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 4 * (3 + 3 + 2), 0)
    gl.vertexAttribPointer(_uv, 2, gl.FLOAT, false, 4 * (3 + 3 + 2), (3 + 3) * 4)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, DRAGON_FACES)
    gl.drawElements(gl.TRIANGLES, DRAGON_N_POINTS, gl.UNSIGNED_INT, 0)
    gl.flush()

    requestAnimationFrame(animate)
  }

  animate()
}

void main()

/**
 * @param type {'left-click' | 'right-click'}
 * @param dragSensitivity {number}
 * @param amortization {number}
 */
function captureMouseEvent(type, dragSensitivity = 2, amortization = 0.95) {
  const EVENT_BUTTON = type === 'left-click' ? 0 : 2

  let THETA = 0
  let PHI = 0

  let isDragging = false

  let dX = 0, dY = 0
  let xPrev, yPrev

  /**
   * @param event {MouseEvent}
   */
  const handleMouseDown = (event) => {
    if (event.button === EVENT_BUTTON) {
      isDragging = true

      xPrev = event.pageX
      yPrev = event.pageY
    }
  }

  const handleMouseUp = () => {
    isDragging = false
  }

  /**
   * @param event {MouseEvent}
   */
  const handleMouseMove = (event) => {
    if (!isDragging) return

    event.preventDefault()

    dX = (event.pageX - xPrev) * dragSensitivity * Math.PI / canvas.width
    dY = (event.pageY - yPrev) * dragSensitivity * Math.PI / canvas.height

    THETA += dX
    PHI += dY

    xPrev = event.pageX
    yPrev = event.pageY
  }

  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mouseup', handleMouseUp)
  canvas.addEventListener('mouseout', handleMouseUp)
  canvas.addEventListener('mousemove', handleMouseMove)

  if (type === 'right-click') {
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  return {
    get dX() {
     return dX
    },
    get dY() {
     return dY
    },
    get THETA() {
     return THETA
    },
    get PHI() {
     return PHI
    },
    get isDragging() {
      return isDragging
    },
    animateAmortization() {
      if (!isDragging) {
        dX *= amortization
        dY *= amortization
        THETA += dX
        PHI += dY
      }
    }
  }
}

/**
 * @param src {string}
 * @returns {Promise<Event, Image>}
 */
async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = src

    image.onload = (event) => resolve({ event, image })
    image.onerror = (error) => reject(error)
  })
}

/**
 *
 * @param src {string}
 * @returns {WebGLTexture}
 */
function loadTexture(src) {
  const texture = gl.createTexture()

  loadImage(src)
    .then(({ image }) => {
      gl.bindTexture(gl.TEXTURE_2D, texture)

      // Flip image upside down
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

      // Loads a texture to GPU
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      // Defines texture parameters (TEXTURE_MAG_FILTER)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      // Defines texture parameters (TEXTURE_MIN_FILTER)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)

      // Generates texture copies
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.bindTexture(gl.TEXTURE_2D, null)
    })

  return texture
}