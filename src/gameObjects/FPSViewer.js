import CanvasKeyboardEvent from "../rul2d/js/KeyboardEventManager.js"
import CanvasText from "../rul2d/js/CanvasText.js"
import ClickableObject from "../rul2d/js/ClickableObject.js"
import { rgba } from "../rul2d/js/utils/colorWork.js"
import GameObject from "../rul2d/js/GameObject.js"
import { floor } from "../rul2d/js/utils/numberWork.js"
import { getContext2d } from "../rul2d/js/utils/canvasWork.js"

export default class FPSViewer extends GameObject {
    constructor(x, y) {
        super(x, y)

        this.color = rgba(10, 25, 79)

        this.restartFPS()
        this.setUpdateTime()
        this.setEveryFrameUpdate()

        this.createKeyboardEvents()
        this.createText()
        this.createButton()

        this.isRenderingFromCameraView(false)
        this.isVisible = +localStorage.getItem('isDebug') ?? 1
    }

    restartFPS() {
        this.fps = NaN
        this.drawFPS = this.fps
        this.time = 0
        this.frameCount = 0
    }

    getFPS(delta) {
        if(this.isUpdateFPSEveryFrame) return 1 / delta
        else return this.fps
    }

    setEveryFrameUpdate(value = true) {
        this.isUpdateFPSEveryFrame = value
    }

    setUpdateTime(seconds = 1) {
        this.updateTime = seconds
    }

    updateFPS(delta = 1/60) {
        this.time += delta

        if(this.time >= this.updateTime) {
            this.time = 0
            this.fps = this.frameCount * (1 / this.updateTime)
            this.frameCount = 0
        }
        else this.frameCount++
    }

    createKeyboardEvents() {
        this.keyboardEvent = new CanvasKeyboardEvent()
        this.keyboardEvent.addControls('keydown')

        this.keyboardEvent.addKey('BracketLeft', e => this.toggleUpdatable(e), {ctrlKey: true, shiftKey: true})
    }

    toggleUpdatable() {
        this.isVisible = !this.isVisible
        localStorage.setItem('isDebug', +this.isVisible)
    }

    createButton() {
        this.button = new ClickableObject()
        this.button.degrees = -5
        this.button.setCallback(point => this.toggleUpdatable())

        this.addSubObjects(this.button)
    }

    createText() {
        this.text = new CanvasText(0, 0, 500, 250)
        this.text.font = {size: '2rem', family: 'Courier, monospace', color: this.color}
        this.text.degrees = -0
        this.text.flip(false, false)

        this.addSubObjects(this.text)
    }

    init(canvas, camera, world) {
        let ctx = getContext2d(canvas)
        this.text.setSizeByText(true)

        this.button.init(canvas, camera)
    }

    draw(ctx) {
        this.text.setText(`FPS: ${this.drawFPS}`)
        this.text.draw(ctx)
        // this.text.drawOutline(ctx)
    }

    update(delta) {
        this.updateFPS(delta)
        this.drawFPS = floor(this.getFPS(delta))
        this.button.rect = this.text
        super.update(delta)
    }
}