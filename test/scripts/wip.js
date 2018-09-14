
import Component from '../../src/Component.js'

export { Component }

Component.namespace = 'test'

export const c1 = new (Component.define('C1', {

    foo(k) {

        console.log('foo 1!', k, this)

    },

    bar() {

        console.log('bar 1!', this)

    },

}))

export const c2 = new (Component.define('C2::C1', {

    foo(k) {

        Component.super.foo(`${k}-${k}`)

        console.log('foo 2!', k, this)

    },

    onBar() {

        console.log('onBar 1')

    }

}))

export const c3 = new (Component.define('C3::C2', {

    foo(k) {

        Component.super.foo(`${k}:${k}`)

        console.log('foo 3!', k, this)

    },

    bar() {

        Component.super.bar()

        console.log('bar 3!', this)

    },

    onBar() {

        console.log('onBaaaaar 2')

    },

}))

c3.foo('a')
c3.bar()

export const Button = Component.define('Button', {})
export const BigButton = Component.define('BigButton::Button', {

    bar() {

    },

    foo() {

    },

    destroy() {

    },

    onDestroy() {

    },

})
export const Menu = Component.define('Menu', {})

export let button = new Button()
export let bigButton = new BigButton()
export let menu = new Menu()
