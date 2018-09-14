
let currentNamespace = null

let dict = {}

const splitIdentifier = identifier => identifier.split(':').reverse()
const buildIdentifier = (name, namespace = currentNamespace) => namespace ? namespace + ':' + name : name
const safeIdentifier = identifier => buildIdentifier(...splitIdentifier(identifier))

let get = identifier => dict[safeIdentifier(identifier)]

let search = (identifier) => {

    if (!identifier)
        return null

    if (dict.hasOwnProperty(identifier))
        return dict[identifier]

    let [name, namespace] = splitIdentifier(identifier)

    if (namespace)
        return null

    identifier = buildIdentifier(name, currentNamespace)

    if (dict.hasOwnProperty(identifier))
        return dict[identifier]

    for (let [currentIdentifier, value] of Object.entries(dict)) {

        let [currentName, currentNamespace] = splitIdentifier(currentIdentifier)

        if (currentName === name)
            return value

    }

    return null

}

let getAvailableIdentifier = (identifier) => {

    identifier = safeIdentifier(identifier)

    if (!dict.hasOwnProperty(identifier))
        return identifier

    let base = identifier
    let index = 1

    do {

        identifier = base + '_' + index++

    } while (dict.hasOwnProperty(identifier))

    return identifier

}

let set = (identifier, value) => {

    identifier = safeIdentifier(identifier)

    dict[identifier] = value

}

let add = (identifier, value) => {

    identifier = getAvailableIdentifier(identifier)

    dict[identifier] = value

    return identifier

}

let register = {

    get,
    search,
    getAvailableIdentifier,
    set,
    add,
    dict,

    get currentNamespace() { return currentNamespace },
    set currentNamespace(value) { currentNamespace = value },

}

export {

    splitIdentifier,
    buildIdentifier,
    safeIdentifier,

}


/*

dict['com.bob:Foo'] = 'com.bob:Foo'
dict['com.bob:Bar'] = 'com.bob:Bar'
dict['org.baz:Foo'] = 'org.baz:Foo'
dict['Qux'] = 'Qux'

currentNamespace = null

console.log(register.search('Foo'))                        // com.bob:Foo
console.log(register.getAvailableIdentifier('Baz'))     // Baz
console.log(register.getAvailableIdentifier('Qux'))     // Qux_1

currentNamespace = 'org.baz'

console.log(register.search('Foo'))                        // org.baz:Foo
console.log(register.getAvailableIdentifier('Baz'))     // org.baz.Baz
console.log(register.getAvailableIdentifier('Qux'))     // org.baz:Qux
console.log(register.getAvailableIdentifier('Foo'))     // org.baz:Foo_1

*/

/*

register.add('Foo', 'Foo!')
register.add('Foo', 'Foo!!')
currentNamespace = 'org.baz'
register.add('Foo', 'Foo!!!')

console.log(dict)
console.log(get('Foo'))
currentNamespace = null
console.log(get('Foo'))

*/

export default register
