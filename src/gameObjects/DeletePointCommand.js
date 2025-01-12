import CanvasShape from "../rul2d/js/CanvasShape.js"
import Point from "../rul2d/js/Point.js"
import { deleteValueFromArray, insertValuesInArray } from "../utils/arrayWork.js"
import Command from "./Command.js"

export default class DeletePointCommand extends Command {
    constructor(shapePoints = [new CanvasShape], point = new Point, index = 0) {
        super()
        
        this.shapePoints = shapePoints
        this.point = point
        this.index = index
    }

    undo() {
        insertValuesInArray(this.shapePoints, this.index, this.point)
    }

    execute() {
        deleteValueFromArray(this.shapePoints, this.index)
    }
}