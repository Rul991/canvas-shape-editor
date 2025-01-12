import CanvasShapeEditor from "./gameObjects/CanvasShapeEditor.js"
import FPSViewer from "./gameObjects/FPSViewer.js"
import Global from "./gameObjects/Global.js"
import Camera from "./rul2d/js/Camera.js"
import GameWorld from "./rul2d/js/GameWorld.js"
import Point from "./rul2d/js/Point.js"
import { createCanvas, getContext2d, resizeCanvas } from "./rul2d/js/utils/canvasWork.js"
import { addWheelEvent, loadCameraState } from "./utils/cameraWork.js"

Point.prototype.toJSON = function() {
    return this.simplify()
}

let global = new Global()
global.load('canvas-shape-editor')
console.log(global)

let canvas = createCanvas()
let ctx = getContext2d(canvas)

resizeCanvas(canvas, canvas.getBoundingClientRect())
addEventListener('resize', e => resizeCanvas(canvas, canvas.getBoundingClientRect()))

let camera = new Camera(ctx)
camera.setZoomLimit(1, 5)
camera.setPosition(120)
camera.setZoom(1.9)
loadCameraState(camera)
addWheelEvent(canvas, camera)

let world = new GameWorld({camera, canvas})

let fps = new FPSViewer(60, -120)
fps.isRenderingFromCameraView(true)
fps.setEveryFrameUpdate(false)
fps.text.font = {
    color: 'blue'
}

let shapeEditor = new CanvasShapeEditor(0, 0)

world.addGameObjects(shapeEditor, fps)
world.update()
console.log(world)