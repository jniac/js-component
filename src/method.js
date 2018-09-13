
import { getLineage } from './utils.js'

export const isMethodDefinition = (method) => {

    if (typeof method === 'function')
        return true

    if (typeof method === 'object' && 'method' in method)
        return true

    return false

}

export const getPrototypeMethod = (type, key) => {

    let array = []

    let reverse = false

    for (let currentType of getLineage(type)) {

        if (key in currentType.methods) {

            let currentMethod = currentType.methods[key]

            let {

                final = false,
                override = false,

            } = currentMethod

            if (array.length === 0 && 'reverse' in currentMethod)
                reverse = currentMethod.reverse

            if (override)
                array = []

            array.push(typeof currentMethod === 'function' ? currentMethod : currentMethod.method)

            if (final)
                break

        }

    }

    // single

    if (array.length === 1) {

        let [method] = array

        return function(...args) {

            if (this.destroyed)
                return this

            let result = method.apply(this, args)

            // return {this} by default, for chaining
            return result === undefined ? this : result

        }

    }

    // multiple

    if (reverse)
        array.reverse()

    return function (...args) {

        if (this.destroyed)
            return this

        let result

        for (let method of array) {

            let currentResult = method.apply(this, args)

            if (currentResult !== undefined)
                result = currentResult

        }

        // return {this} by default, for chaining
        return result === undefined ? this : result

    }

}
