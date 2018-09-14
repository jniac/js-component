
import { readonly, Average } from './utils.js'
import Component from './Component.js'

let instances = new Set()
let dirtyInstances = new Set()
let stillDirtyInstances = new Set()
let instanceCounter = 0

const newInstance = (instance, args) => {

    instances.add(instance)
    instance.constructor.all.add(instance)

    readonly(instance, {

        uid: instanceCounter++,
        props: {},
        state: {},

    })

    instance.start(...args)

    setDirty(instance)

}

const destroyInstance = (instance, fromBasePrototype = false) => {

    if (fromBasePrototype === false)
        instance.destroy()

    readonly(instance, {

        destroyed: true,
        props: null,
        state: null,

    })

    instances.delete(instance)
    instance.constructor.all.delete(instance)

}

const setDirty = instance => {

    if (locked === false) {

        instance.dirty = true
        dirtyInstances.add(instance)

    } else {

        onPostUpdate(() => setDirty(instance))

    }

}

let locked = false

const isLocked = () => locked

let onUpdateSet = new Set
let onPostUpdateSet = new Set

const onUpdate = callback => onUpdateSet.add(callback)
const onPostUpdate = callback => onPostUpdateSet.add(callback)

let updateAverage = new Average(60)
let dirtyAverage = new Average(60)

let frame = 0

const update = () => {

    requestAnimationFrame(update)

    let t = performance.now()

    for (let callback of onUpdateSet) {

        callback()

    }

    locked = true

    dirtyAverage.next(dirtyInstances.size)

    for (let instance of dirtyInstances) {

        let stillDirty = instance.update() === Component.DIRTY

        if (stillDirty) {

            stillDirtyInstances.add(instance)

        } else {

            instance.dirty = false

        }

    }

    for (let instance of dirtyInstances) {

        instance.postUpdate()

    }

    dirtyInstances.clear()

    // permutation
    let tmp = stillDirtyInstances
    stillDirtyInstances = dirtyInstances
    dirtyInstances = tmp

    locked = false

    for (let callback of onPostUpdateSet) {

        callback()

    }

    frame++

    updateAverage.next(performance.now() - t)

}

update()

export default {

    instances,

    onUpdateSet,
    onPostUpdateSet,

    newInstance,
    destroyInstance,
    setDirty,
    isLocked,
    updateAverage,

    get frame() { return frame },

    average: {

        get update() { return updateAverage.average },
        get dirty() { return dirtyAverage.average },

    },

}
