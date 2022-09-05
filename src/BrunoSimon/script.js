const FOV = 75
const WIDTH_SIZE = 800
const HEIGHT_SIZE = 600

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('.webgl')
})
const aspectRatio = WIDTH_SIZE / HEIGHT_SIZE

renderer.setSize(WIDTH_SIZE, HEIGHT_SIZE)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(FOV, aspectRatio)

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)

scene.add(camera)
scene.add(mesh)

camera.position.z = 3;

mesh.rotation.y = 20;

renderer.render(scene, camera)