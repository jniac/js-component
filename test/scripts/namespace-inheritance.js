
import Component from '../../src/Component.js'
import html from '../files/html.js'

export { Component, html }



// Component.namespace provide an easy way to allow Component with the same name...
Component.namespace = 'my-package-one.ui'

Component.define('Button', {

    start(label, onclick) {

        this.element = html.button.style({ 'font-size':'1em', padding:'0 16px', height: '50px' })(label).appendTo(stage)
        this.element.onclick = onclick

    },

})



Component.namespace = 'my-package-two.ui'

// ... and allow also complex inheritance (across different namespace)
let inheritance = 'Button :: my-package-one.ui:Button'

export const Button = Component.define(inheritance, {

    start(label, onclick) {

        Component.super.start(label.toUpperCase(), onclick)

    },

})



// ...and also allow instantiation:

// full package namespace is always an option (Button)...
export let button = Component.new('Button', 'press me', () => alert('hey! you pressed me!'))

// but may be specified to retrieve components not from the current namespace (my-package-one.ui:Button)
Component.new('my-package-one.ui:Button', 'original button...', () => alert('...from my-package-one.ui'))
