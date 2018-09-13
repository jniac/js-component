# js-component
minimal code for Component behavior

```javascript

import Component from './Component.js'

const Button = Component.Def({

    Component: 'Button',

    start(label) {

        let div = document.createElement('div')
        div.innerHTML = label
        div.onclick = () => alert(`label: ${label}`)
        document.body.append(div)

        this.setProps({ div })

    },

    destroy() {

        let { div } = this.props

        button.remove()

    },

})

let button = new Button('a nice button')

```


### build
```shell
# regular:
rollup -c
# minified:
rollup -c --min
```
et voilà!
