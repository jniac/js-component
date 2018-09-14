const readonly = (target, props, { enumerable = true, configurable = true } = {}) => {

    for (let [key, value] of Object.entries(props)) {

        Object.defineProperty(target, key, { value, enumerable, configurable });

    }

    return target

};

const getter = (target, props, { enumerable = true, configurable = true } = {}) => {

    for (let [key, get] of Object.entries(props)) {

        Object.defineProperty(target, key, { get, enumerable, configurable });

    }

};

// extract patch the spread operator:
// let { a, b, ...rest } = object
// <=>
// let [a, b, rest] = extract(object, 'a', 'b')
const extract = (object, ...keys) => {

    let result = new Array(keys.length);
    let rest = {};

    for (let key in object) {

        let index = keys.indexOf(key);

        if (index >= 0) {

            result[index] = object[key];

        } else {

            rest[key] = object[key];

        }

    }

    result.push(rest);

    return result

};



function Average({ length = 10, value = 0 } = {}) {

    let array = new Array(length);

    for (let i = 0; i < length; i++)
		array[i] = value;

    let index = 0;

    let sum = value * length, average = value;

    let next = number => {

        sum += number - array[index];
		array[index] = number;
		average = sum / length;

		index++;

        if (index === length)
            index = 0;

		return average

    };

	return {

		next,
		get array() { return [...array] },
		get index() { return index },
		get sum() { return sum },
		get average() { return average },

    }

}

let currentNamespace = null;

let dict = {};

const splitIdentifier = identifier => identifier.split(':').reverse();
const buildIdentifier = (name, namespace = currentNamespace) => namespace ? namespace + ':' + name : name;
const safeIdentifier = identifier => buildIdentifier(...splitIdentifier(identifier));

let get = identifier => dict[safeIdentifier(identifier)];

let search = (identifier) => {

    if (!identifier)
        return null

    if (dict.hasOwnProperty(identifier))
        return dict[identifier]

    let [name, namespace] = splitIdentifier(identifier);

    if (namespace)
        return null

    identifier = buildIdentifier(currentNamespace, name);

    if (dict.hasOwnProperty(identifier))
        return dict[identifier]

    for (let [currentIdentifier, value] of Object.entries(dict)) {

        let [currentName, currentNamespace] = splitIdentifier(currentIdentifier);

        if (currentName === name)
            return value

    }

    return null

};

let getAvailableIdentifier = (identifier) => {

    identifier = safeIdentifier(identifier);

    if (!dict.hasOwnProperty(identifier))
        return identifier

    let base = identifier;
    let index = 1;

    do {

        identifier = base + '_' + index++;

    } while (dict.hasOwnProperty(identifier))

    return identifier

};

let set = (identifier, value) => {

    identifier = safeIdentifier(identifier);

    dict[identifier] = value;

};

let add = (identifier, value) => {

    identifier = getAvailableIdentifier(identifier);

    dict[identifier] = value;

    return identifier

};

let register = {

    get,
    search,
    getAvailableIdentifier,
    set,
    add,
    dict,

    get currentNamespace() { return currentNamespace },
    set currentNamespace(value) { currentNamespace = value; },

};

let instances = new Set();
let dirtyInstances = new Set();
let stillDirtyInstances = new Set();
let instanceCounter = 0;

const newInstance = (instance, args) => {

    instances.add(instance);
    instance.constructor.all.add(instance);

    readonly(instance, {

        uid: instanceCounter++,
        props: {},
        state: {},

    });

    instance.start(...args);

    setDirty(instance);

};

const destroyInstance = (instance, fromBasePrototype = false) => {

    if (fromBasePrototype === false)
        instance.destroy();

    readonly(instance, {

        destroyed: true,
        props: null,
        state: null,

    });

    instances.delete(instance);
    instance.constructor.all.delete(instance);

};

const setDirty = instance => {

    if (locked === false) {

        instance.dirty = true;
        dirtyInstances.add(instance);

    } else {

        onPostUpdate(() => setDirty(instance));

    }

};

let locked = false;

const isLocked = () => locked;

let onUpdateSet = new Set;
let onPostUpdateSet = new Set;

const onPostUpdate = callback => onPostUpdateSet.add(callback);

let updateAverage = new Average(60);
let dirtyAverage = new Average(60);

let frame = 0;

const update = () => {

    requestAnimationFrame(update);

    let t = performance.now();

    for (let callback of onUpdateSet) {

        callback();

    }

    locked = true;

    dirtyAverage.next(dirtyInstances.size);

    for (let instance of dirtyInstances) {

        let stillDirty = instance.update() === Component.DIRTY;

        if (stillDirty) {

            stillDirtyInstances.add(instance);

        } else {

            instance.dirty = false;

        }

    }

    for (let instance of dirtyInstances) {

        instance.postUpdate();

    }

    dirtyInstances.clear();

    // permutation
    let tmp = stillDirtyInstances;
    stillDirtyInstances = dirtyInstances;
    dirtyInstances = tmp;

    locked = false;

    for (let callback of onPostUpdateSet) {

        callback();

    }

    frame++;

    updateAverage.next(performance.now() - t);

};

update();

var lifecycle = {

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

var basePrototype = {

    set(props) {

        Object.assign(this, props);

    },

    start() {

    },

    destroy() {

        // a chance to intercept the will of destruction!

    },

    onDestroy() {

        // onDestroy is always called

        lifecycle.destroyInstance(this, true);

    },

    setDirty() {

        // the component will update on the next update cycle

        lifecycle.setDirty(this);

    },

    forceUpdate() {

        // same as setDirty, but more the name is more meaningfull
        
        lifecycle.setDirty(this);

    },

    update() {

        // update the component here

    },

    postUpdate() {

        // cf. lateUpate (Unity)

    },

    setProps(propsChunk) {

        // props do not affect dirty state...

        Object.assign(this.props, propsChunk);

    },

    setState(stateChunk, { compare = true } = {}) {

        // ... but the state does!
        // only if 'compare' === true

        if (lifecycle.isLocked()) {

            lifecycle.onPostUpdate(() => this.setState(stateChunk, { compare }));

            return

        }

        let { state } = this;

        if (compare) {

            for (let [key, value] of Object.entries(stateChunk)) {

                if (state[key] !== value) {

                    state[key] = value;
                    lifecycle.setDirty(this);

                }

            }

        } else {

            Object.assign(state, stateChunk);
            lifecycle.setDirty(this);

        }

    },

}

const crawl = (set, key, args, proxy) => {

    for (let instance of set) {

        if (key in instance) {

            instance[key].apply(instance, args);

        }

    }

    return proxy

};

function Collection(instances) {

    let set = new Set(instances);

    const union = other => Collection([...set, ...other]);

    const biggest = (callback) => {

        let max = -Infinity;
        let result = null;

        for (let item of set) {

            let number = callback(item);

            if (number > max) {

                max = number;
                result = item;

            }

        }

        return result

    };

    let proxy = new Proxy({ union, biggest }, {

        get(target, key) {

            if (key in target)
                return target[key]

            if (key in set)
                return set[key].bind(set)

            return (...args) => crawl(set, key, args, proxy)

        },

    });

    return proxy

}

const getConstructor = (name, newInstance) => (new Function('newInstance', `return function ${name} (){ newInstance(this, arguments) }`))(newInstance);

const isMethodDefinition = (method) => {

    if (typeof method === 'function')
        return true

    if (typeof method === 'object' && 'method' in method)
        return true

    return false

};

const extractMethod = (value) => {

    if (typeof value === 'function')
        return value

    // let { method, ...props } = value
    let [method, props] = extract(value, 'method');

    Object.assign(method, props);

    return method

};

const bindPrototype = (constructor, parent, props) => {

    for (let [key, value] of Object.entries(props)) {

        if (isMethodDefinition(value)) {

            let method = extractMethod(value);

            constructor.methods[key] = method;

            if (key.slice(0, 2) == 'on') {

                constructor.listeners[key.slice(2, 3).toLowerCase() + key.slice(3)] = method;

            }

            constructor.prototype[key] = function(...args) {

                if (this.destroyed)
                    return this

                currentCall.parent = parent;
                currentCall.thisArg = this;

                let result = method.apply(this, args);

                let cancelListeners = result === Component.CANCEL;

                // currentCall.superCall is a bit tricky flag
                // it allows to avoid to call listeners on each Component.super.{key}() call
                // cancelListeners is here to allow method cancelation (eg: destroy cancelation)
                if (currentCall.superCall === false && cancelListeners === false) {

                    let current = this.constructor;

                    while (current) {

                        if (current.listeners.hasOwnProperty(key)) {

                            current.listeners[key].apply(this);

                        }

                        current = current.parent;

                    }

                }

                currentCall.superCall = false;

                return result

            };

        } else {

            constructor.prototype[key] = Object.freeze(value);

        }

    }

};

const define = (definitionName, definition) => {

    let [identifier, parentIdentifier] = definitionName.split('::');

    let parent = register.search(parentIdentifier) || Component;

    let [name] = splitIdentifier(register.getAvailableIdentifier(identifier));

    let constructor = getConstructor(name, lifecycle.newInstance);

    identifier = register.add(identifier, constructor);

    Object.setPrototypeOf(constructor.prototype, parent.prototype);

    // let { static:Static, ...props } = definition
    // oups [rollup] does not parse the spread operator, so let's use [extract()] for the moment
    let [Static = {}, props = {}] = extract(definition, 'static');

    readonly(constructor, Static);

    readonly(constructor, {

        parent,
        identifier,
        methods: {},
        listeners: {},
        all: Collection(),

    });

    bindPrototype(constructor, parent, props);

    return constructor

};

function Component() {}

Component.CANCEL = Symbol('Component.CANCEL');
Component.DIRTY = Symbol('Component.DIRTY');
Component.methods = {};
Component.listeners = {};
bindPrototype(Component, null, basePrototype);



let currentCall = { parent:null, thisArg:null, superCall:false };

Component.super = new Proxy({}, {

    get(target, key) {

        let { parent, thisArg } = currentCall;

        while (parent) {

            currentCall.superCall = true;

            if (parent.prototype.hasOwnProperty(key))
                return parent.prototype[key].bind(thisArg)

            parent = parent.parent;

        }

    },

});

getter(Component, {

    dict: () => register.dict,

});

Object.defineProperties(Component, {

    namespace: {

        enumerable: true,
        get: () => register.currentNamespace,
        set: value => register.currentNamespace = value,

    },

});

readonly(Component, {

    define,
    Collection,
    lifecycle,
    instances: lifecycle.instances,

});

export default Component;
