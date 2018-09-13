
import { readonly, getLineage, Average } from './utils.js'

let instances = new Set()

let counter = 0
let frame = 0

const newInstance = (instance, args) => {

    readonly(instance, { uid:counter++ })

    for(let type of getLineage(instance.type)) {

        type.constructor.apply(instance, args)

    }

    instance.dirty = true
    instance.start(...args)

    instances.add(instance)

}

const destroyInstance = (instance) => {

    instances.delete(instance)

}

let lateUpdateSet = new Set()           // instances inside
let postUpdateSet = new Set()           // callbacks inside

const postUpdate = callback => postUpdateSet.add(callback)

let currentUpdateComponent
const isLocked = instance => currentUpdateComponent === instance

let frameAverage = new Average({ length:60 })

const frameUpdate = () => {

    let t = performance.now()

    requestAnimationFrame(frameUpdate)



    // UPDATE
    for (let instance of instances) {

        if (instance.dirty) {

            currentUpdateComponent = instance

            instance.dirty = instance.update() === true

            lateUpdateSet.add(instance)

        }

    }

    currentUpdateComponent = null

    for (let callback of postUpdateSet)
        callback()

    postUpdateSet.clear()

    // LATE UPDATE
    for (let instance of lateUpdateSet) {

        instance.lateUpdate()

    }

    lateUpdateSet.clear()



    frameAverage.next(performance.now() - t)

    frame++

}

frameUpdate()

export {

    instances,
    frameAverage,

    frame,

    newInstance,
    destroyInstance,
    isLocked,
    postUpdate,

}
