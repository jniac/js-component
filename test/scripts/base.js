
import Component from '../../src/Component.js'
import html from '../files/html.js'
import * as U from '../files/utils.js'

export { Component, html }

Component.namespace = 'test'

export let Button = Component.define('Button', {

    start(label, callback) {

        this.div = html.button(label).appendTo(stage)
        this.div.onclick = callback

    },

    destroy() {

        this.div.remove()

    },

})

export let BigButton = Component.define('BigButton::Button', {

    static: {

        enhanceLabel: label => `[{( ${label} )}]`

    },

    start(label, callback) {

        Component.super(BigButton.enhanceLabel(label.toUpperCase()), callback)

    },

    onDestroy() {

        console.log(`BigButton died (${this.idString})`)

    },

})

export let Menu = Component.define('Menu', {

    start(entries) {

        for (let [label, callback, { big = false } = {}] of entries) {

            let button = big
                ? new Button(label, callback)
                : new BigButton(label, callback)

            this.add(button)

        }

    },

    add(child) {

        this.div.append(child.div)

    },

})

const makeMenu = () => {

    new Menu([
        ['Press', () => {}],
        ['Hold', () => {}],
        ['Start', () => {}, { big:true }],
        ['Clone Menu', makeMenu],
        ['Reset', reset],
    ])

}

const reset = () => {

    Menu.all.destroy()

    makeMenu()

}

makeMenu()
