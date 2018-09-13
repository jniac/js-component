
import Component from '../../src/Component.js'
import html from '../html.js'
import * as U from './utils.js'

export { Component, html }

export let components = new Set()

export let Foo = Component.Def({

    Component: {

        name: 'Foo',

    },

    start(color = '#eee') {

        components.add(this)

        let close = html.div
            .class('close')
            ('x').element

        close.onclick = () => this.destroy()

        let div = html.div
            .class('block')
            .style({ 'background-color': color })(

                    html.div(this.idString),
                    close,

            ).element

        stage.append(div)

        this.setProps({ div })

    },

    destroy() {

        components.delete(this)

        let { div } = this.props

        div.remove()

    },

})

export let AnimatedFoo = Component.Def({

    Component: {

        name: 'AnimatedFoo',
        extends: Foo

    },

    start() {

        this.setProps({

            startTime: performance.now(),

        })

        let { div } = this.props
        let counterDiv = html.div.style({ 'font-size': '3em' })().element
        div.append(counterDiv)

        this.setProps({ counterDiv })

        let counter = 0

        this.setState({ counter })

    },

    update() {

        let { startTime, div, counterDiv } = this.props
        let { counter } = this.state

        let time = (performance.now() - startTime) / 1e3

        div.style['background-color'] = U.FFFFFF(.5 + .5 * Math.sin(time), 0, .5 + .5 * Math.sin(time * 3))
        counterDiv.innerHTML = counter

    },

    lateUpdate() {

        let { counter } = this.state

        counter++

        this.setState({ counter })

    },

})






stage.style.display =  'inline-flex'



let fooButton = html.button.style({ height: '30px' })('new Foo({ random color })').element

fooButton.onclick = () => new Foo(U.randomColor())



let animatedFooButton = html.button.style({ height: '30px' })('new AnimatedFoo()').element

animatedFooButton.onclick = () => new AnimatedFoo()



let clearButton = html.button.style({ height: '30px' })('clear').element

clearButton.onclick = () => {

    for (let c of components)
        c.destroy()

}



stage.append(html.div.class('menu')(
    fooButton,
    animatedFooButton,
    clearButton,
).element)

export let foo = new Foo()
export let animatedFoo = new AnimatedFoo()

// foo.start()
