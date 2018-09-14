
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

    let proxy = new Proxy({}, {

        get(target, key) {

            if (key in set)
                return set[key].bind(set)

            return (...args) => crawl(set, key, args, proxy)

        },

    })

    return proxy

}
