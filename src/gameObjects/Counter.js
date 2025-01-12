import CanvasText from "../rul2d/js/CanvasText.js"
import GameObject from "../rul2d/js/GameObject.js"
import Rectangle from "../rul2d/js/Rectangle.js"
import Button from "./Button.js"

export default class Counter extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.create()
        this.doWhenValueUpdated()
        this.setObject(null, '')
        this.setTitle(null)
    }

    setTitle(text = '') {
        this.titleText = text
    }

    setObject(obj, key) {
        this.key = key
        this.increaseableObject = obj
        this.addValue(0)
    }

    doWhenValueUpdated(callback = (value = 0) => {}) {
        this.valueUpdateCallback = callback
    }
    
    addValue(value = 1) {
        if(!this.key || !this.increaseableObject) return
        
        if(typeof this.increaseableObject[this.key] === 'number') {
            this.increaseableObject[this.key] += value
        }

        this.valueUpdateCallback(this.increaseableObject[this.key])
        this.text.setText(`${this.titleText ?? this.key}: ${this.increaseableObject[this.key]}`)
    }

    createDecreaseButton() {
        this.decreaseButton = new Button()
        this.decreaseButton.setCallback(point => {
            this.addValue(-1)
        })

        this.addSubObjects(this.decreaseButton)
    }

    createText() {
        this.text = new CanvasText(0, 40)
        this.text.setSize(70, 40)
        this.text.font = {
            size: '0.5rem'
        }
        this.addSubObjects(this.text)
    }

    createIncreaseButton() {
        this.increaseButton = new Button(40, 0)
        this.increaseButton.setText('+')
        this.increaseButton.setCallback(point => {
            this.addValue(1)
        })
        
        this.addSubObjects(this.increaseButton)
    }

    create() {
        this.createDecreaseButton()
        this.createIncreaseButton()
        this.createText()
    }

    init(canvas, camera, world) {
        super.init(canvas, camera, world)
        this.decreaseButton.init(canvas, camera, world)
        this.increaseButton.init(canvas, camera, world)
    }

    _draw(ctx) {
        this.decreaseButton.draw(ctx)
        this.increaseButton.draw(ctx)
        this.text.draw(ctx)
    }

    update(delta) {
        super.update(delta)
        this.decreaseButton.update(delta)
        this.increaseButton.update(delta)
    }
}