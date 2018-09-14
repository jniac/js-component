# js-component
minimal code for Component behavior

```javascript

import Component from '../../src/Component.js'

const Button = Component.Def({

    Component: 'Button',

    on__start(label, onclick) {

        let button = document.createElement('button')
        button.innerHTML = label
        button.onclick = onclick
        document.body.append(button)

        this.setProps({ button })

    },

    destroy() {

        let { button } = this.props

        button.remove()

    },

})



let clones = new Set

const CloneButton = Component.Def({

    Component: 'CloneButton:Button',

    start(label, onclick) {

        Component.super(`${label} #${this.uid}`, onclick)

        clones.add(this)

    },

    destroy() {

        clones.delete(this)

    },

})

const makeClone = () => new CloneButton('clone', makeClone)

new Button('alert(nice!)', () => alert(`nice!`))
new Button('clear', () => Component.Collection(clones).destroy())
new Button('make a clone', makeClone)

```


### build
```shell
# regular:
rollup -c
# minified:
rollup -c --min
```
et voilà!
