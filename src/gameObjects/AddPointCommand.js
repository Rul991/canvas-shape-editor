import CanvasShape from "../rul2d/js/CanvasShape.js"
import Point from "../rul2d/js/Point.js"
import Command from "./Command.js"

export default class AddPointCommand extends Command {
    constructor(shape = new CanvasShape, point = new Point) {
        super()
        this.shape = shape
        this.point = point
    }

    execute() {
        this.shape.shapePoints.push(this.point)
        this.shape.updatePath()
    }

    undo() {
        this.shape.shapePoints.pop()
        this.shape.updatePath()
    }
}