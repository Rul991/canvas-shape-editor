import CanvasPath from "../rul2d/js/CanvasPath.js"
import GameObject from "../rul2d/js/GameObject.js"
import Point from "../rul2d/js/Point.js"
import { strokeArc } from "../rul2d/js/utils/canvasWork.js"
import { hsla } from "../rul2d/js/utils/colorWork.js"

export default class Grid extends GameObject {
    constructor(x, y) {
        super(x, y)
        
        this.drawablePoints = []
        this.pointRadius = 5
        this.pointColor = 'orange'

        this.create()
        this.doWhenGridUpdate()
        this.setGridSize(1)
    }

    setAllColor(color) {
        this.color = color ?? this.color
        this.forSubObjects(sub => sub.setColor(color))
    }

    setSize(width, height) {
        this.width = width || 1
        this.height = height || this.width
        this.updateGridPoints()
    }

    createGrid() {
        this.grid = new CanvasPath()
        this.addSubObjects(this.grid)
    }

    drawGrid(ctx) {
        this.grid.draw(ctx)
        this.drawablePoints.forEach(point => {
            this.camera.culling(point, ({x, y}) => {
                this.doWithOpacity(ctx, () => {
                    strokeArc(ctx, x, y, this.pointRadius, this.pointColor)
                })
            })
        })
    }

    setGridSize(columns = 0, rows = 0) {
        this.columns = columns || 1
        this.rows = rows || this.columns
        this.updateGridPoints()
    }

    getCellSize() {
        let { width, height } = this
        return new Point(width / this.columns, height / this.rows)
    }

    updateGridPoints() {
        this.grid.removeAllPoints()
        this.drawablePoints = []

        let cellSize = this.getCellSize()
        let direction = new Point(1, 1)
        let startX = direction.x > 0 ? 0 : this.columns
        
        const condition = (pos, size, direction) => {
            if(direction > 0) return pos <= size
            else return pos >= 0
        }

        for (let y = 0; y <= this.rows; y++) {
            direction.x *= -1
            startX = direction.x > 0 ? 0 : this.columns
            
            for (let x = startX; condition(x, this.columns, direction.x); x += direction.x) {
                let newPoint = new Point(cellSize.x * x, cellSize.y * y)
                this.grid.addPoint(newPoint)
                this.drawablePoints.push(newPoint)
            }

        }

        for (let x = startX; condition(x, this.columns, direction.x); x += direction.x) {
            this.grid.addPoint(new Point(cellSize.x * x, this.height * (0.5 + (direction.y * 0.5))))
            this.grid.addPoint(new Point(cellSize.x * x, this.height * (0.5 - (direction.y * 0.5))))
            direction.y *= -1
        }

        this.gridUpdateCallback(this)
    }

    doWhenGridUpdate(callback = (grid = new Grid) => {}) {
        this.gridUpdateCallback = callback
    }

    create() {
        this.createGrid()
    }

    init(canvas, camera, world) {
        super.init(canvas, camera, world)
    }

    _draw(ctx) {
        if(!this.isNeedDraw()) return
        this.drawGrid(ctx)
    }
    
    update(delta) {
        super.update(delta)
    }
}