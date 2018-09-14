
const crawl = (set, key, args, proxy) => {

    for (let instance of set) {

        if (key in instance) {

            instance[key].apply(instance, args)

        }

    }

    return proxy

}

export default function Collection(instances) {

    let set = new Set(instances)

    const union = other => Collection([...set, ...other])

    const bigger = (callback) => {

        let max = -Infinity
        let result = null

        for (let item of set) {

            let number = callback(item)

            if (number > max) {

                max = number
                result = item

            }

        }

        return result

    }

    let proxy = new Proxy({ union, bigger }, {

        get(target, key) {

            if (key in target)
                return target[key]

            if (key in set)
                return set[key].bind(set)

            return (...args) => crawl(set, key, args, proxy)

        },

    })

    return proxy

}
