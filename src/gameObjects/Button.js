import CanvasText from "../rul2d/js/CanvasText.js"
import ClickableObject from "../rul2d/js/ClickableObject.js"
import GameObject from "../rul2d/js/GameObject.js"
import Point from "../rul2d/js/Point.js"
import PointerableObject from "../rul2d/js/PointerableObject.js"
import RoundedRectangle from "../rul2d/js/RoundedRectangle.js"

export default class Button extends GameObject {
    static hoverPoint = new Point
    
    constructor(x, y) {
        super(x, y)

        this.isPressed = false
        this.startTimeClick = Date.now()
        this.multipleClickTime = 500
        this.hoverColor = 'black'

        this.setAfterText(null)
        this.create()
    }

    setAfterText(text = '') {
        this.afterText = text
    }

    setSize(width, height) {
        this.width = width || 1
        this.height = height || this.width

        this.forSubObjects(sub => {
            if(sub.setSize) sub.setSize(this.width, this.height)
        })
    }

    setText(text = '') {
        this.defaultText = text
        this.text.setText(text)
    }

    setCallback(callback = (point = new Point) => {}) {
        this.pointerable.setCallback(point => {
            this.hoverColor = 'red'
            let timeDifference = Date.now() - this.startTimeClick
            if(!this.isPressed) {
                this.startTimeClick = Date.now()
                callback(point)
            }

            else if(timeDifference >= this.multipleClickTime) {
                callback(point)
            }

            this.isPressed = true
        })
    }

    createText() {
        this.text = new CanvasText(6, 2)
        this.text.font = {
            color: 'black',
            size: '29px'
        }
        this.text.setText('-')
        this.addSubObjects(this.text)
    }

    createPointerable() {
        this.pointerable = new PointerableObject()
        this.pointerable.setHoverCallback(point => {
            Button.hoverPoint.point = point
            this.isPressed = false
        })
        this.pointerable.doIfNotInteracted(point => {
            if(!this.isPressed && this.afterText) this.text.setText(this.defaultText)
            this.isPressed = false
            this.hoverColor = 'black'
        })
        this.addSubObjects(this.pointerable)
    }

    createRoundedRectangle() {
        this.roundedRectangle = new RoundedRectangle()
        this.roundedRectangle.setRadius(10)
        this.roundedRectangle.color = 'white'
        this.addSubObjects(this.roundedRectangle)
    }

    create() {
        this.createRoundedRectangle()
        this.createPointerable()
        this.createText()
        this.setSize(30, 30)
    }

    init(canvas, camera, world) {
        super.init(canvas, camera, world)
        this.pointerable.init(canvas, camera, world)
    }

    _draw(ctx) {
        this.roundedRectangle.fill(ctx)
        this.roundedRectangle.stroke(ctx, this.hoverColor)
        this.text.draw(ctx)
        if(this.pointerable.isHovered) Button.hoverPoint.draw(ctx, 'blue')
    }

    update(delta) {
        super.update(delta)
        this.pointerable.update(delta)
    }
}