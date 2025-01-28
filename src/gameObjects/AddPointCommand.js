import CanvasShape from "../rul2d/js/CanvasShape.js"
import Point from "../rul2d/js/Point.js"
import Command from "./Command.js"
import Global from "./Global.js"

export default class AddPointCommand extends Command {
    constructor(shape = new CanvasShape, point = new Point) {
        super()
        this.shape = shape
        this.point = point
        this.global = new Global
    }

    execute() {
        this.shape.shapePoints.push(this.point)
        this.shape.updatePath()
        this.save()
    }

    undo() {
        this.shape.shapePoints.pop()
        this.shape.updatePath()
        this.save()
    }

    save() {
        this.global.set('shapePoints', this.shape.shapePoints)
    }
}