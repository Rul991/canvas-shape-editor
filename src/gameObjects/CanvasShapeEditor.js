import GameObject from "../rul2d/js/GameObject.js"
import KeyboardEventManager from "../rul2d/js/KeyboardEventManager.js"
import Point from "../rul2d/js/Point.js"
import Rectangle from "../rul2d/js/Rectangle.js"
import { hsla } from "../rul2d/js/utils/colorWork.js"
import Button from "./Button.js"
import Counter from "./Counter.js"
import Global from "./Global.js"
import Grid from "./GridObject.js"
import PathCanvas from "./PathCanvas.js"

export default class CanvasShapeEditor extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.initValues = {}
        
        this.undoHistory = []
        this.redoHistory = []
        
        this.create()
    }

    toggleFill() {
        this.path.toggleFill()
    }
    
    undo() {
        if(!this.undoHistory.length) return
        let global = new Global

        let lastCommand = this.undoHistory.pop()
        lastCommand.undo()
        this.redoHistory.push(lastCommand)

        global.set('undoHistory', this.undoHistory)
    }

    redo() {
        if(!this.redoHistory.length) return

        let lastCommand = this.redoHistory.pop()
        lastCommand.execute()
        this.undoHistory.push(lastCommand)
    }

    reset() {
        let global = new Global
        this.resetPath()
        for (const name in this.initValues) {
            const {object, key, value} = this.initValues[name]

            object[key] = value
            global.set(name, value)
        }
        this.updateTextForCounters(this.subObjects.counter)
    }

    resetPath(global = new Global) {
        this.path.shape.shapePoints = []
        this.path.shape.updatePath()
        global.set('shapePoints', this.path.shape.shapePoints)
    }

    downloadJSON() {
        let link = document.createElement('a')
        link.download = 'shape.json'
        
        let stringifiedShape = JSON.stringify(this.path.shape.shapePoints)
        let url = URL.createObjectURL(new Blob([stringifiedShape]))

        link.href = url
        link.click()
    }

    copyJSON() {
        let stringifiedShape = JSON.stringify(this.path.shape.shapePoints)
        navigator.clipboard
            .writeText(stringifiedShape)
            .then(() => {console.log('copied')})
    }

    updateCameraLimit() {
        this.camera.setLimit(
            new Point(-2000),
            new Point(120)
        )
    }

    setPositionForObjects(startPoint = new Point, objects = [], callback = (factRect = new Rectangle, currentPoint = new Point) => {}) {
        let currentPoint = new Point
        currentPoint.point = startPoint

        for (const counter of objects) {
            // console.log(currentPoint.x, currentPoint.y)
            counter.point = currentPoint
            counter.offset.point = currentPoint

            let newPoint = callback(counter.factRect, currentPoint)
            currentPoint.addPosition(newPoint)
        }
    }

    updateTextForCounters(counters = [new Counter]) {
        for (const counter of counters) {
            counter.addValue(0)
        }
    }

    setPositionForCounters(startPoint = new Point, counters = [new Counter]) {
        this.setPositionForObjects(startPoint, counters, ({height}) => {
            return new Point(0, height)
        })
    }

    setPositionForButtons(startPoint = new Point, buttons = [new Button]) {
        this.setPositionForObjects(startPoint, buttons, ({width}) => {
            return new Point(width + 5, 0)
        })
    }

    createObject(options = {}, callback = options => ({})) {
        let {name} = options
        let object = callback(options)
        this.addSubObjects(object)

        if(name) {
            if(typeof name != 'string') {
                if(!name.length) this[name] = object
            }
        }

        return object
    }

    createCounter(options = {name: '', title: '', object: null, key: '', callback: (value = 0) => {}}) {
        return this.createObject(options, ({name, title, object, key, callback}) => {
            this.initValues[name] = {
                key, 
                object,
                value: object[key]
            }

            let global = new Global
            let counter = new Counter

            let savedValue = global.get(name)
            if(savedValue) object[key] = savedValue

            counter.setTitle(title)
            counter.setObject(object, key)
            callback(object[key])

            counter.doWhenValueUpdated(value => {
                callback(value)
                global.set(name, object[key])
            })

            return counter
        })
    }

    createVisibleCounter() {
        this.createCounter({
            name: 'visibleGridCounter',
            title: `Grid's visibility`,
            object: this.grid,
            key: 'isVisible',
            keyboardButton: 'KeyQ',
            callback: value => {
                if(value >= 1) this.grid.isVisible = 1
                else this.grid.isVisible = 0
            }
        })
    }

    createPointRadiusCounter() {
        this.createCounter({
            name: 'pointRadiusCounter',
            title: `Point's radius`,
            object: this.grid,
            key: 'pointRadius',
            keyboardButton: 'KeyQ',
            callback: value => {
                let radius = {
                    min: 0,
                    max: 20
                }

                if(value > radius.max) this.grid.pointRadius = radius.min
                else if(value < radius.min) this.grid.pointRadius = radius.max
                this.path.updateRectForClickable()
            }
        })
    }

    createColumnCounter() {
        this.createCounter({
            name: 'columnCounter',
            title: 'Count of columns',
            object: this.grid,
            key: 'columns',
            callback: value => {
                if(value < 0) this.grid.columns = 0
                this.grid.updateGridPoints()
            }
        })
    }

    createRowCounter() {
        this.createCounter({
            name: 'rowCounter',
            title: 'Count of rows',
            object: this.grid,
            key: 'rows',
            callback: value => {
                if(value < 0) this.grid.rows = 0
                this.grid.updateGridPoints()
            }
        })
    }

    createWidthCounter() {
        this.createCounter({
            name: 'widthCounter',
            title: `Grid's width`,
            object: this.grid,
            key: 'width',
            callback: value => {
                if(value < 10) this.grid.width = 10
                this.grid.updateGridPoints()
            }
        })
    }

    createHeightCounter() {
        this.createCounter({
            name: 'heightCounter',
            title: `Grid's heightPoint`,
            object: this.grid,
            key: 'height',
            callback: value => {
                if(value < 10) this.grid.height = 10
                this.grid.updateGridPoints()
            }
        })
    }

    createButton(options = {name: '', size: new Point(), text: '', callback: (point = new Point) => {}}) {
        return this.createObject(options, ({size, text, callback}) => {
            let button = new Button(0, -50)
            button.setSize(size.x, size.y)
            button.setText(text)
            button.setCallback(callback)

            return button
        })
    }

    createResetButton() {
        this.createButton({
            name: 'resetButton',
            size: new Point(95, 30),
            text: 'Reset',
            callback: point => {
                this.reset()
            }
        })

        this.keyboardManager.addKey('KeyR', e => {
            this.reset()
        })
    }

    createFillingButton() {
        this.createButton(
            {
                name: 'fillingButton',
                size: new Point(80, 30),
                text: 'Fill',
                callback: point => {
                    this.toggleFill()
                }
            }
        )

        this.keyboardManager.addKey('KeyF', e => {
            this.toggleFill()
        }, {ctrlKey: true, isPreventDefault: true})
    }

    createSaveButton() {
        this.createButton({
            name: 'saveButton',
            size: new Point(80, 30),
            text: 'Save',
            callback: point => {
                this.downloadJSON()
            }
        })

        this.keyboardManager.addKey('KeyS', e => {
            this.downloadJSON()
        }, {ctrlKey: true, isPreventDefault: true})
    }

    createCopyButton() {
        this.createButton({
            name: 'copyButton',
            size: new Point(80, 30),
            text: 'Copy',
            callback: point => {
                this.copyJSON()
            }
        })

        this.keyboardManager.addKey('KeyC', e => {
            this.copyJSON()
        }, {ctrlKey: true})
    }

    createKeyboardEventManager() {
        this.keyboardManager = new KeyboardEventManager()
        this.keyboardManager.addControls()

        this.keyboardManager.addKey('KeyZ', e => {
            this.undo()
        }, {ctrlKey: true})

        this.keyboardManager.addKey('KeyY', e => {
            this.redo()
        }, {ctrlKey: true})
    }

    createGrid() {
        this.grid = new Grid(0, 0)
        this.grid.isVisible = 1
        this.grid.setAllColor('black')
        this.grid.setSize(200)
        this.grid.setGridSize(5)
        this.addSubObjects(this.grid)
    }

    createPath() {
        this.path = new PathCanvas()
        this.path.setGrid(this.grid)
        this.path.setHistory(this.undoHistory, this.redoHistory)
        this.addSubObjects(this.path)
    }

    create() {
        this.createKeyboardEventManager()
        this.createGrid()
        this.createPath()
        this.createResetButton()
        this.createSaveButton()
        this.createCopyButton()
        this.createFillingButton()
        this.setPositionForButtons(new Point(0, -50), this.subObjects.button)
        this.createVisibleCounter()
        this.createPointRadiusCounter()
        this.createColumnCounter()
        this.createRowCounter()
        this.createWidthCounter()
        this.createHeightCounter()
        this.setPositionForCounters(new Point(-90, -50), this.subObjects.counter)
    }

    init(canvas, camera, world) {
        super.init(canvas, camera, world)

        this.forSubObjects(sub => {
            sub.init(canvas, camera, world)
        })
        this.updateCameraLimit()
    }

    _draw(ctx) {
        this.path.clickable.draw(ctx, hsla(0, 0, 0, 0.15))
        
        this.forSubObjects(sub => {
            sub.draw(ctx)
        })
        // this.drawOutline(ctx)    
    }

    update(delta) {
        super.update(delta)

        this.forSubObjects(sub => {
            sub.update(delta)
        })
    }
}