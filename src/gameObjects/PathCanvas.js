import CanvasShape from "../rul2d/js/CanvasShape.js"
import ClickableObject from "../rul2d/js/ClickableObject.js"
import GameObject from "../rul2d/js/GameObject.js"
import KeyboardEventManager from "../rul2d/js/KeyboardEventManager.js"
import Point from "../rul2d/js/Point.js"
import { hsla } from "../rul2d/js/utils/colorWork.js"
import Vector2 from "../rul2d/js/Vector2.js"
import AddPointCommand from "./AddPointCommand.js"
import Command from "./Command.js"
import DeletePointCommand from "./DeletePointCommand.js"
import EditPointCommand from "./EditPointCommand.js"
import Global from "./Global.js"
import Grid from "./GridObject.js"

export default class PathCanvas extends GameObject {
    constructor(x, y) {
        super(x, y)

        let global = new Global

        this.create()
        this.loadPath()

        this.isMagnitize = true
        this.isFilling = global.get('isFilling', false)

        this.editedPointIndex = -1
    }

    toggleFill() {
        let global = new Global

        this.isFilling = !this.isFilling
        global.set('isFilling', this.isFilling)
    }

    savePoints(global = new Global) {
        global.set('shapePoints', this.shape.shapePoints)
    }

    loadPath() {
        let global = new Global

        this.shape.shapePoints = global.get('shapePoints', [])
        this.savePoints(global)

        this.shape.updatePath()
    }

    setHistory(undo = [], redo = []) {
        this.undoHistory = undo
        this.redoHistory = redo
    }

    clearRedoHistory() {
        this.redoHistory.length = 0
    }

    setGrid(grid = new Grid) {
        this.grid = grid
        this.grid.doWhenGridUpdate(() => {
            let {width, height} = this.grid

            this.updateRectForClickable()
            this.shape.setSize(width, height)
        })
    }

    magnitizeToPoints(point = new Point) {
        if(!this.isMagnitize) return point
        if(!this.grid) return point

        let cellSize = this.grid.getCellSize()
        let magnitizedPoint = new Point
        magnitizedPoint.point = point

        let nearestPoint = new Point(
            Math.round(point.x / cellSize.x) * cellSize.x,
            Math.round(point.y / cellSize.y) * cellSize.y
        )

        if(nearestPoint.getDistance(point) <= this.grid.pointRadius) {
            magnitizedPoint.point = nearestPoint
        }
        else {
            for (const drawablePoint of this.shape.drawablePoints) {
                let newPoint = new Point()
                newPoint.point = drawablePoint
                newPoint.addPosition(this.shape.center)
                
                if(point.getDistance(newPoint) <= Point.drawRadius) {
                    magnitizedPoint.point = newPoint
                    break
                }  
            }
        }

        return magnitizedPoint
    }

    createShape() {
        this.shape = new CanvasShape()
        this.addSubObjects(this.shape)
    }

    initShape(canvas, camera, world) {
        this.shape.init(canvas, camera, world)
        this.shape.setSize(this.grid.width, this.grid.height)
    }

    drawShape(ctx) {
        this.shape.stroke(ctx)

        if(this.isFilling) {
            this.shape.opacity = 0.1
            this.shape.fill(ctx)
            this.shape.opacity = 1
        }

        this.shape.drawPoints(ctx)
        this.shape.drawPointByIndex(ctx, [-1], 'red')

        if(this.editedPointIndex != -1) {
            this.shape.drawPointByIndex(ctx, [this.editedPointIndex], 'orange')
        }
    }

    getRelativePoint(point = new Point) {
        let {width, height} = this.grid
        let magnitizedPoint = this.magnitizeToPoints(point)
        return new Point(magnitizedPoint.x / width, magnitizedPoint.y / height)
    }

    addCommand(command = new Command) {
        command.execute()
        this.undoHistory.push(command)

        let global = new Global
        global.set('undoHistory', this.undoHistory)
    }

    addPoint(point = new Point){
        this.clearRedoHistory()

        const command = new AddPointCommand(this.shape, point)
        this.addCommand(command)
        this.savePoints()
    }

    editPoint(point = new Point) {
        const shapePoint = this.shape.shapePoints[this.editedPointIndex]
                    
        if(shapePoint) {
            this.clearRedoHistory()
            const lastPoint = shapePoint.point
            const command = new EditPointCommand(shapePoint, point, lastPoint)
            this.addCommand(command)
            this.savePoints()
        }

        this.editedPointIndex = -1
    }

    selectPoint(point = new Point) {
        for (let i = this.shape.shapePoints.length - 1; i >= 0 ; i--) {
            const shapePoint = this.shape.shapePoints[i]
            if(shapePoint.x == point.x && shapePoint.y == point.y) {
                this.editedPointIndex = i
                break
            }
        }
    }

    deletePoint(point = new Point) {
        if(this.editedPointIndex == -1) return

        let command = new DeletePointCommand(this.shape.shapePoints, point, this.editedPointIndex)
        this.addCommand(command)
        this.savePoints()
    }

    createClickable() {
        this.clickable = new ClickableObject()
        this.addSubObjects(this.clickable)

        this.clickable.setCallback(point => {
            if(this.clickable.lastEvent.button) return
            const relativePoint = this.getRelativePoint(point)

            if(this.clickable.lastEvent.altKey) {
                this.selectPoint(relativePoint)
            }
            else if(this.clickable.lastEvent.shiftKey) {
                this.selectPoint(relativePoint)
                this.deletePoint(relativePoint)
                this.editedPointIndex = -1
            }
            else {
                if(this.editedPointIndex == -1) {
                    this.addPoint(relativePoint)
                }
                else {
                    this.editPoint(relativePoint)
                }
            }
        })
    }

    updateRectForClickable() {
        this.clickable.setSize(
            this.grid.width + this.grid.pointRadius * 2, 
            this.grid.height + this.grid.pointRadius * 2
        )
        this.clickable.setOffsetPosition(-this.grid.pointRadius)
    }

    initClickable(canvas, camera, world) {
        this.clickable.init(canvas, camera, world)
        this.updateRectForClickable()
    }

    create() {
        this.createShape()
        this.createClickable()
    }

    init(canvas, camera, world) {
        super.init(canvas, camera, world)
        this.initShape(canvas, camera, world)
        this.initClickable(canvas, camera, world)
    }

    _draw(ctx) {
        this.drawShape(ctx)
    }

    update(delta) {
        super.update(delta)
    }
}