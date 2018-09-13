
import { readonly, getter } from './utils.js'
import { isMethodDefinition, getPrototypeMethod } from './method.js'
import { instances, frameAverage, frame, newInstance, destroyInstance, isLocked, postUpdate } from './lifecycle.js'

// [name, constructor]
let types = {}
let typeCounter = 0

// [constructor, type]
let typeMap = new Map()

const newType = (name = 'Component') => {

    if (name in types) {

        let base = name
        let index = 1

        do {

            name = `${base}_${index++}`

        } while (name in types)

    }

    let type = readonly({}, {

        uid: typeCounter++,
        name,
        methods: {},

    })

    types[name] = type

    return { name, type }

}

const getConstructor = (name) => {

    return new Function('newInstance', 'typeMap', `return function ${name}() {

        newInstance(this, arguments)

        // FIXME: if typeMap.has(this.constructor) === false : the prototype has been produced via classic [class] pattern
        // console.log(this, typeMap.has(this.constructor))
        // console.log(Object.getOwnPropertyNames(this.constructor.prototype))

    }`)(newInstance, typeMap)

}

const getParent = (parent) => {

    if (!parent)
        return types.Component

    if (typeof parent === 'string')
        return types[parent]

    if (typeof parent === 'function')
        return typeMap.get(parent)

    return parent

}

const getDescription = (description) => {

    if (typeof description === 'string') {

        if (description.includes(':')) {

            let [name, parent] = description.split(/\s*:\s*/)

            return { name, extends:parent }

        }

        return { name: description }

    }

    return description || {}

}

const ComponentDefinition = function (definition) {

    // IMPORTANT: getParent() must ABSOLUTELY be called before newType, otherwise: "Uncaught TypeError: Cyclic __proto__ value"
    let description = getDescription(definition.Component)

    let parent = getParent(description.extends)

    let { name, type } = newType(description.name)
    let Constructor = getConstructor(name)

    readonly(type, {

        Constructor,
        parent,
        definition,
        constructor: definition.constructor,

    })

    typeMap.set(Constructor, type)

    if (parent)
        Object.setPrototypeOf(Constructor.prototype, parent.Constructor.prototype)

    readonly(Constructor, { type })
    readonly(Constructor.prototype, { type })

    for (let key of Object.getOwnPropertyNames(definition)) {

        if (key === 'Component')
            continue

        if (key === 'constructor')
            continue

        let property = Object.getOwnPropertyDescriptor(definition, key)

        if ('value' in property) {

            let value = definition[key]

            if (isMethodDefinition(value)) {

                type.methods[key] = value

                Constructor.prototype[key] = getPrototypeMethod(type, key)

            } else {

                Constructor.prototype[key] = value

            }

        } else {

            Object.defineProperty(Constructor.prototype, key, property)

        }


    }

    return Constructor

}

const RootComponent = ComponentDefinition({

    Component: 'Component',

    dirty: false,
    destroyed: false,

    getIdString() {

        return `${this.type.name}:${this.uid}`

    },

    get idString() {

        return this.getIdString()

    },

    constructor() {

        this.props = {}
        this.state = {}

    },

    setProps(propsChunk) {

        Object.assign(this.props, propsChunk)

    },

    setState(stateChunk, { compare = true } = {}) {

        if (isLocked(this)) {

            postUpdate(() => this.setState(stateChunk, { compare }))

            return

        }

        let { state } = this

        if (compare) {

            for (let [key, value] of Object.entries(stateChunk)) {

                if (state[key] !== value) {

                    state[key] = value
                    this.dirty = true

                }

            }

        } else {

            Object.assign(state, stateChunk)
            this.dirty = true

        }

    },

    forceUpdate() {

        this.dirty = true

    },

    start: {

        method() {},

    },

    destroy: {

        reverse: true,
        method() {

            this.destroyed = true
            destroyInstance(this)

        },

    },

    update: {

        method() {}

    },

    lateUpdate: {

        method() {}

    },

})



readonly(RootComponent, {

    types,
    instances,
    frameAverage,
    Def: ComponentDefinition,

})

getter(RootComponent, {

    frame: () => frame,

})

export default RootComponent
