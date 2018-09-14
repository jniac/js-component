
import { readonly, getter, extract } from './utils.js'
import namespace, { splitIdentifier } from './namespace.js'
import lifecycle from './lifecycle.js'
import basePrototype from './basePrototype.js'
import Collection from './Collection.js'

const getConstructor = (name, newInstance) => (new Function('newInstance', `return function ${name} (){ newInstance(this, arguments) }`))(newInstance)

const isMethodDefinition = (method) => {

    if (typeof method === 'function')
        return true

    if (typeof method === 'object' && 'method' in method)
        return true

    return false

}

const extractMethod = (value) => {

    if (typeof value === 'function')
        return value

    // let { method, ...props } = value
    let [method, props] = extract(value, 'method')

    Object.assign(method, props)

    return method

}

const bindPrototype = (constructor, parent, props) => {

    for (let [key, value] of Object.entries(props)) {

        if (isMethodDefinition(value)) {

            let method = extractMethod(value)

            constructor.methods[key] = method

            if (key.slice(0, 2) == 'on') {

                constructor.listeners[key.slice(2, 3).toLowerCase() + key.slice(3)] = method

            }

            constructor.prototype[key] = function(...args) {

                if (this.destroyed)
                    return this

                currentCall.parent = parent
                currentCall.thisArg = this

                let result = method.apply(this, args)

                let cancelListeners = result === Component.CANCEL

                // currentCall.superCall is a bit tricky flag
                // it allows to avoid to call listeners on each Component.super.{key}() call
                // cancelListeners is here to allow method cancelation (eg: destroy cancelation)
                if (currentCall.superCall === false && cancelListeners === false) {

                    let current = this.constructor

                    while (current) {

                        if (current.listeners.hasOwnProperty(key)) {

                            current.listeners[key].apply(this)

                        }

                        current = current.parent

                    }

                }

                currentCall.superCall = false

                return result

            }

        } else {

            constructor.prototype[key] = Object.freeze(value)

        }

    }

}

const define = (definitionName, definition) => {

    let [identifier, parentIdentifier] = definitionName.split('::')

    let parent = namespace.search(parentIdentifier) || Component

    let [name] = splitIdentifier(namespace.getAvailableIdentifier(identifier))

    let constructor = getConstructor(name, lifecycle.newInstance)

    identifier = namespace.add(identifier, constructor)

    Object.setPrototypeOf(constructor.prototype, parent.prototype)

    // let { static:Static, ...props } = definition
    // oups [rollup] does not parse the spread operator, so let's use [extract()] for the moment
    let [Static = {}, props = {}] = extract(definition, 'static')

    readonly(constructor, Static)

    readonly(constructor, {

        parent,
        identifier,
        methods: {},
        listeners: {},

    })

    bindPrototype(constructor, parent, props)

    return constructor

}

function Component() {}

Component.CANCEL = Symbol('Component.CANCEL')
Component.DIRTY = Symbol('Component.DIRTY')
Component.methods = {}
Component.listeners = {}
bindPrototype(Component, null, basePrototype)



let currentCall = { parent:null, thisArg:null, superCall:false }

Component.super = new Proxy({}, {

    get(target, key) {

        let { parent, thisArg } = currentCall

        while (parent) {

            currentCall.superCall = true

            if (parent.prototype.hasOwnProperty(key))
                return parent.prototype[key].bind(thisArg)

            parent = parent.parent

        }

    },

})

getter(Component, {

    dict: () => namespace.dict,

})

Object.defineProperties(Component, {

    namespace: {

        enumerable: true,
        get: () => namespace.currentNamespace,
        set: value => namespace.currentNamespace = value,

    },

})

readonly(Component, {

    define,
    Collection,
    lifecycle,
    instances: lifecycle.instances,

})

export default Component
