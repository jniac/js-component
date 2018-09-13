/*

	Component.js
	2018-09-13 10:57 GMT(+2)
	https://github.com/jniac/js-component

	MIT License
	
	Copyright (c) 2018 Joseph Merdrignac
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

*/

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

const getLineage = (target, descending = true) => {

    let array = [target];

    while(target = target.parent)
        descending ? array.unshift(target) : array.push(target);

    return array

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

const isMethodDefinition = (method) => {

    if (typeof method === 'function')
        return true

    if (typeof method === 'object' && 'method' in method)
        return true

    return false

};

const getPrototypeMethod = (type, key) => {

    let array = [];

    let reverse = false;

    for (let currentType of getLineage(type)) {

        if (key in currentType.methods) {

            let currentMethod = currentType.methods[key];

            let {

                final = false,
                override = false,

            } = currentMethod;

            if (array.length === 0 && 'reverse' in currentMethod)
                reverse = currentMethod.reverse;

            if (override)
                array = [];

            array.push(typeof currentMethod === 'function' ? currentMethod : currentMethod.method);

            if (final)
                break

        }

    }

    // single

    if (array.length === 1) {

        let [method] = array;

        return function(...args) {

            if (this.destroyed)
                return this

            let result = method.apply(this, args);

            // return {this} by default, for chaining
            return result === undefined ? this : result

        }

    }

    // multiple

    if (reverse)
        array.reverse();

    return function (...args) {

        if (this.destroyed)
            return this

        let result;

        for (let method of array) {

            let currentResult = method.apply(this, args);

            if (currentResult !== undefined)
                result = currentResult;

        }

        // return {this} by default, for chaining
        return result === undefined ? this : result

    }

};

let instances = new Set();

let counter = 0;
let frame = 0;

const newInstance = (instance, args) => {

    readonly(instance, { uid:counter++ });

    for(let type of getLineage(instance.type)) {

        type.constructor.apply(instance, args);

    }

    instance.dirty = true;
    instance.start(...args);

    instances.add(instance);

};

const destroyInstance = (instance) => {

    instances.delete(instance);

};

let lateUpdateSet = new Set();           // instances inside
let postUpdateSet = new Set();           // callbacks inside

const postUpdate = callback => postUpdateSet.add(callback);

let currentUpdateComponent;
const isLocked = instance => currentUpdateComponent === instance;

let frameAverage = new Average({ length:60 });

const frameUpdate = () => {

    let t = performance.now();

    requestAnimationFrame(frameUpdate);



    // UPDATE
    for (let instance of instances) {

        if (instance.dirty) {

            currentUpdateComponent = instance;

            instance.dirty = instance.update() === true;

            lateUpdateSet.add(instance);

        }

    }

    currentUpdateComponent = null;

    for (let callback of postUpdateSet)
        callback();

    postUpdateSet.clear();

    // LATE UPDATE
    for (let instance of lateUpdateSet) {

        instance.lateUpdate();

    }

    lateUpdateSet.clear();



    frameAverage.next(performance.now() - t);

    frame++;

};

frameUpdate();

// [name, constructor]
let types = {};
let typeCounter = 0;

// [constructor, type]
let typeMap = new Map();

const newType = (name = 'Component') => {

    if (name in types) {

        let base = name;
        let index = 1;

        do {

            name = `${base}_${index++}`;

        } while (name in types)

    }

    let type = readonly({}, {

        uid: typeCounter++,
        name,
        methods: {},

    });

    types[name] = type;

    return { name, type }

};

const getConstructor = (name) => {

    return new Function('newInstance', 'typeMap', `return function ${name}() {

        newInstance(this, arguments)

        // FIXME: if typeMap.has(this.constructor) === false : the prototype has been produced via classic [class] pattern
        // console.log(this, typeMap.has(this.constructor))
        // console.log(Object.getOwnPropertyNames(this.constructor.prototype))

    }`)(newInstance, typeMap)

};

const getParent = (parent) => {

    if (!parent)
        return types.Component

    if (typeof parent === 'string')
        return types[parent]

    if (typeof parent === 'function')
        return typeMap.get(parent)

    return parent

};

const getDescription = (description) => {

    if (typeof description === 'string') {

        if (description.includes(':')) {

            let [name, parent] = description.split(/\s*:\s*/);

            return { name, extends:parent }

        }

        return { name: description }

    }

    return description || {}

};

const ComponentDefinition = function (definition) {

    // IMPORTANT: getParent() must ABSOLUTELY be called before newType, otherwise: "Uncaught TypeError: Cyclic __proto__ value"
    let description = getDescription(definition.Component);

    let parent = getParent(description.extends);

    let { name, type } = newType(description.name);
    let Constructor = getConstructor(name);

    readonly(type, {

        Constructor,
        parent,
        definition,
        constructor: definition.constructor,

    });

    typeMap.set(Constructor, type);

    if (parent)
        Object.setPrototypeOf(Constructor.prototype, parent.Constructor.prototype);

    readonly(Constructor, { type });
    readonly(Constructor.prototype, { type });

    for (let key of Object.getOwnPropertyNames(definition)) {

        if (key === 'Component')
            continue

        if (key === 'constructor')
            continue

        let property = Object.getOwnPropertyDescriptor(definition, key);

        if ('value' in property) {

            let value = definition[key];

            if (isMethodDefinition(value)) {

                type.methods[key] = value;

                Constructor.prototype[key] = getPrototypeMethod(type, key);

            } else {

                Constructor.prototype[key] = value;

            }

        } else {

            Object.defineProperty(Constructor.prototype, key, property);

        }


    }

    return Constructor

};

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

        this.props = {};
        this.state = {};

    },

    setProps(propsChunk) {

        Object.assign(this.props, propsChunk);

    },

    setState(stateChunk, { compare = true } = {}) {

        if (isLocked(this)) {

            postUpdate(() => this.setState(stateChunk, { compare }));

            return

        }

        let { state } = this;

        if (compare) {

            for (let [key, value] of Object.entries(stateChunk)) {

                if (state[key] !== value) {

                    state[key] = value;
                    this.dirty = true;

                }

            }

        } else {

            Object.assign(state, stateChunk);
            this.dirty = true;

        }

    },

    forceUpdate() {

        this.dirty = true;

    },

    start: {

        method() {},

    },

    destroy: {

        reverse: true,
        method() {

            this.destroyed = true;
            destroyInstance(this);

        },

    },

    update: {

        method() {}

    },

    lateUpdate: {

        method() {}

    },

});



readonly(RootComponent, {

    types,
    instances,
    frameAverage,
    Def: ComponentDefinition,

});

getter(RootComponent, {

    frame: () => frame,

});

export default RootComponent;
