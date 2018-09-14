
import lifecycle from './lifecycle.js'

export default {

    set(props) {

        Object.assign(this, props)

    },

    start() {

    },

    destroy() {

        // a chance to intercept the will of destruction!

    },

    onDestroy() {

        // onDestroy is always called

        lifecycle.destroyInstance(this, true)

    },

    setDirty() {

        lifecycle.setDirty(this)

    },

    update() {

        // update the component here

    },

    postUpdate() {

        // cf. lateUpate (Unity)

    },

    setProps(propsChunk) {

        // props do not affect dirty state...

        Object.assign(this.props, propsChunk)

    },

    setState(stateChunk, { compare = true } = {}) {

        // ... but the state does!
        // only if 'compare' === true

        if (lifecycle.isLocked()) {

            lifecycle.onPostUpdate(() => this.setState(stateChunk, { compare }))

            return

        }

        let { state } = this

        if (compare) {

            for (let [key, value] of Object.entries(stateChunk)) {

                if (state[key] !== value) {

                    state[key] = value
                    lifecycle.setDirty(this)

                }

            }

        } else {

            Object.assign(state, stateChunk)
            lifecycle.setDirty(this)

        }

    },

}
