import Point from "../rul2d/js/Point.js"
import Command from "./Command.js"

export default class EditPointCommand extends Command {
    constructor(point = new Point, currentPoint = new Point, lastPoint = new Point) {
        super()
        this.point = point
        this.currentPoint = currentPoint
        this.lastPoint = lastPoint
    }

    undo() {
        this.point.point = this.lastPoint
    }

    execute() {
        this.point.point = this.currentPoint
    }
}