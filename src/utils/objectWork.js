export const getObjectValueByPath = (obj = {}, path = '') => {
    let properties = path.split('.')
    let returnedObject = obj

    for (const property of properties) {
        returnedObject = returnedObject[property]
    }

    return returnedObject
}