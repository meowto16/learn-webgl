const LIBS = {
  degToRad: (angle) => angle * Math.PI / 180,
  get_projection: function(angle, a, zMin, zMax) {
    const tan = Math.tan(LIBS.degToRad(0.5 * angle))
    const A = -(zMax + zMin) / (zMax - zMin)
    const B = (-2 * zMax * zMin) / (zMax - zMin)

    return [
      0.5 / tan, 0            , 0, 0,
      0        , 0.5 * a / tan, 0, 0,
      0        , 0            , A, -1,
      0        , 0            , B, 0,
    ];
  },
  get_I4: () => [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
  ],
  rotateX: function(m, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)

    const mv1 = m[1]
    const mv5 = m[5]
    const mv9 = m[9]

    m[1] = m[1] *c -m[2] * s
    m[5] = m[5] *c -m[6] * s
    m[9] = m[9] *c -m[10] * s

    m[2] = m[2] * c + mv1 * s
    m[6] = m[6] * c + mv5 * s
    m[10]= m [10] * c + mv9 * s
  },
  rotateY: function(m, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)

    const mv0 = m[0]
    const mv4 = m[4]
    const mv8 = m[8]

    m[0]=c*m[0]+s*m[2]
    m[4]=c*m[4]+s*m[6]
    m[8]=c*m[8]+s*m[10]

    m[2] = c * m[2] - s * mv0
    m[6] = c * m[6] - s * mv4
    m[10] = c * m[10] - s * mv8
  },
  rotateZ: function(m, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)

    const mv0 = m[0]
    const mv4 = m[4]
    const mv8 = m[8]

    m[0] = c * m[0] - s * m[1]
    m[4] = c * m[4] - s * m[5]
    m[8] = c * m[8] - s * m[9]

    m[1] = c * m[1] + s * mv0
    m[5] = c * m[5] + s * mv4
    m[9] = c * m[9] + s * mv8
  },
  translateZ: function(m, t) {
    m[14] += t
  },
}