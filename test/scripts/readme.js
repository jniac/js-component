
import Component from '../../src/Component.js'

Component.namespace = 'readme.test'

const Button = Component.define('Button', {

    start(label, onclick) {

        let button = document.createElement('button')
        button.innerHTML = label
        button.onclick = onclick
        document.querySelector('#stage').append(button)

        this.setProps({ button })

    },

    onDestroy() {

        let { button } = this.props

        button.remove()

    },

})

new Button('make a clone', () => new Button('clone', () => alert('clone!')))
new Button('kill the last button', () => Button.all.biggest(i => i.uid).destroy())

export {

    Component,
    Button,

}
