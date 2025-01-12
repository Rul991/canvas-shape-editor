import Camera from "../rul2d/js/Camera.js"
import Point from "../rul2d/js/Point.js"

export const addWheelEvent = (canvas = new HTMLCanvasElement, camera = new Camera) => {
    canvas.addEventListener('wheel', e => {
        e.preventDefault()
    
        let {deltaX, deltaY, ctrlKey, shiftKey, clientX: x, clientY: y} = e

        if(shiftKey) {
            deltaX = deltaY
            deltaY = 0
        }
    
        if(ctrlKey) {
            camera.addZoom(-deltaY / 100 * camera._zoom)
        }
        
        else {
            camera.addPosition(new Point(-deltaX * (1 / camera._zoom), -deltaY * (1 / camera._zoom)))
        }
    
        saveCameraState(camera)
    })

    let touchStart = new Point(null)

    canvas.addEventListener('touchstart', e => {
        let {touches} = e
        
        if(touches.length >= 2) {
            let {clientX, clientY} = touches[0]
            touchStart = new Point(clientX, clientY)
        }
    })

    canvas.addEventListener('touchmove', e => {
        let {touches} = e

        if(touches.length == 2) {
            let {clientX, clientY} = touches[0]
            camera.addPosition(new Point(clientX - touchStart.x, clientY - touchStart.y))
            touchStart = new Point(clientX, clientY)
        }
        else if(touches.length == 3) {
            let {clientX, clientY} = touches[0]
            let clientPoint = new Point(clientX, clientY)
            let distance = clientPoint.getDistance(touchStart) / 100
            let direction = 0

            if(clientPoint.y < touchStart.y) direction = 1
            else direction = -1

            camera.addZoom(distance * direction)
            let zoom = new Point(0.025, 3)
            camera._zoom = Math.max(zoom.x, camera._zoom)
            camera._zoom = Math.min(zoom.y, camera._zoom)

            touchStart = new Point(clientX, clientY)
        }
    })

    canvas.addEventListener('touchend', e => {
        
    })
}

export const saveCameraState = (camera = new Camera) => {
    let {x, y, _zoom: zoom} = camera
    localStorage.setItem('cameraState', JSON.stringify({x, y, zoom}))
}

export const loadCameraState = (camera = new Camera) => {
    let item = localStorage.getItem('cameraState') || null
    if(!item) return false
    if(!item.length) return false

    let {x, y, zoom} = JSON.parse(item)

    camera.x = x
    camera.y = y

    camera._zoom = zoom

    return true
}