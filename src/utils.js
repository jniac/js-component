
const readonly = (target, props, { enumerable = true, configurable = true } = {}) => {

    for (let [key, value] of Object.entries(props)) {

        Object.defineProperty(target, key, { value, enumerable, configurable })

    }

    return target

}

const getter = (target, props, { enumerable = true, configurable = true } = {}) => {

    for (let [key, get] of Object.entries(props)) {

        Object.defineProperty(target, key, { get, enumerable, configurable })

    }

}

const getLineage = (target, descending = true) => {

    let array = [target]

    while(target = target.parent)
        descending ? array.unshift(target) : array.push(target)

    return array

}


function Average({ length = 10, value = 0 } = {}) {

    let array = new Array(length)

    for (let i = 0; i < length; i++)
		array[i] = value

    let index = 0

    let sum = value * length, average = value

    let next = number => {

        sum += number - array[index]
		array[index] = number
		average = sum / length

		index++

        if (index === length)
            index = 0

		return average

    }

	return {

		next,
		get array() { return [...array] },
		get index() { return index },
		get sum() { return sum },
		get average() { return average },

    }

}

export {

    readonly,
    getter,
    getLineage,
    Average,

}
