export const insertValuesInArray = (array = [], index = 0, ...values) => {
    const {length} = array

    if(index >= length) {
        index = index % length
    }
    else if(index < 0) {
        let indexInBounds = index % length
        index = length - indexInBounds
        if(!indexInBounds) index--
    }

    if(index == 0) {
        array.unshift(...values)
    }
    else if(index == length - 1) {
        array.push(...values)
    }
    else {
        let start = array.slice(0, index)
        let end = array.slice(index)

        array.length = 0
        array.push(...start, ...values, ...end)
    }

    return array
}

export const deleteValueFromArray = (array = [], index = 0) => {
    if(!array.length) return
    
    let start = array.slice(0, index)
    let end = array.slice(index + 1)

    array.length = 0
    array.push(...start, ...end)

    return array
}