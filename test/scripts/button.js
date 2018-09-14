
// import Component from '../../src/Component.js'
import Component from '../../build/Component.js'
import html from '../files/html.js'
import * as U from '../files/utils.js'

export { Component, html }

Component.namespace = 'test.button'

export let mainButton

export const Button = Component.define('Button', {

    start(label, onclick) {

        this.element = html.button.style({ 'font-size':'1em', padding:'0 16px', height: '50px' })(label).appendTo(stage)
        this.element.onclick = onclick

        this.set({ label })
        this.setState({ extraLabel:'' })

        if (mainButton)
            mainButton.setState({ extraLabel:Component.instances.size })

    },

    onDestroy() {

        this.element.remove()

        if (mainButton)
            setTimeout(() => mainButton.setState({ extraLabel:Component.instances.size }), 0)

    },

    update() {

        let { label } = this
        let { extraLabel } = this.state

        this.element.innerHTML = `${label} (${extraLabel})`

    },

})

export const CloneButton = Component.define('CloneButton::Button', {

    static: {

        clones: Component.Collection(),

    },

    onStart() {

        CloneButton.clones.add(this)

    },

    onDestroy() {

        CloneButton.clones.delete(this)

    },

})

export const IndestructibleCloneButton = Component.define('IndestructibleCloneButton::CloneButton', {

    start() {

        Component.super.start(`Can't be cleared! but...`, () => this.destroy(true))

        this.element.style.color = '#c03'

    },

    destroy(force = false) {

        if (force)
            return null

        return Component.CANCEL

    },

})

export const BigButton = Component.define('BigButton::Button', {

    start(label, onclick) {

        Component.super.start(`[ ${label.toUpperCase()} ]`, onclick)

        this.element.style['font-size'] = '1.5em'
        this.element.style['font-weight'] = '900'

    },

})

export const TimeButton = Component.define('TimeButton::CloneButton', {

    onStart() {

        this.setProps({ start:Component.lifecycle.frame })

        this.element.style['font-family'] = 'monospace'
        this.element.onclick = () => this.setProps({ start:Component.lifecycle.frame })

    },

    update() {

        let { start } = this.props

        this.element.innerHTML = (Component.lifecycle.frame - start).toFixed().split('').join('-')

        return Component.DIRTY

    },

})

const makeClone = () => {

    if (Math.random() > .25) {

        new CloneButton(`clo${'o'.repeat(Math.random() * 6)}ne`, makeClone)

    } else if (Math.random() > .5) {

        new IndestructibleCloneButton()

    } else {

        new TimeButton()

    }

}

export let clearButton = new BigButton('clear', () => CloneButton.clones.destroy())

mainButton = new Button('press', makeClone)

export let cloneButton = new CloneButton('clone', makeClone)

export let indestructibleCloneButton = new IndestructibleCloneButton()

export let timeButton = new TimeButton()
