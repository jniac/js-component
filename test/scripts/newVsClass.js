
import Component from '../../src/Component.js'
import html from '../html.js'

export { Component, html }

export const Foo = Component.Def({

    start() {

        this.setProps({

            div: html.div(`[${this.idString}]: hello`).appendTo(stage)

        })

    },

})

export class Qux extends Component {

    constructor() {

        super()

        console.log('Qux')

    }

    start() {

        this.setProps({

            div: html.div(`[${this.idString}]: hellox`).appendTo(stage)

        })

    }

}

export let foo = new Foo()
export let qux = new Qux()
