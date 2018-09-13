
import Component from '../../src/Component.js'
import html from '../html.js'
import * as U from './utils.js'

export { Component, html }

export const C1 = Component.Def({

    Component: 'C1',

    foo() {

        console.log(`C1.foo (${this.idString})`)

    },

    fooReverse: {
        reverse: true,
        method() {

            console.log(`C1.fooReverse (${this.idString})`)

        },
    },

    fooFinal() {

        console.log(`C1.fooFinal (${this.idString})`)

    },

})

export const C2 = Component.Def({

    Component: 'C2:C1',

})

export const C3 = Component.Def({

    Component: 'C3:C2',

    foo() {

        console.log(` C3.foo (${this.idString})`)

    },

    fooReverse() {

        console.log(` C3.fooReverse (${this.idString})`)

    },

})

export const C4 = Component.Def({

    Component: 'C4:C3',

    foo() {

        console.log(`  C4.foo (${this.idString})`)

    },

    fooReverse() {

        console.log(`  C4.fooReverse (${this.idString})`)

    },

    fooFinal: {
        final: true,
        method() {

            console.log(`C4.fooFinal (${this.idString})`)

        },
    },

})

export const C5 = Component.Def({

    Component: 'C5:C4',

    // ignored, because of 'final' flag on {C4}
    fooFinal() {

        console.log('canceled')

    },

})

export let c1 = new C1()
export let c2 = new C2()
export let c3 = new C3()
export let c5 = new C5()

c5.foo()
c5.fooReverse()
c5.fooFinal()
