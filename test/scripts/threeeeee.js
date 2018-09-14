
import Component from '../../src/Component.js'
import html from '../files/html.js'
import * as U from '../files/utils.js'

export { Component, html }





// three.js
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75, 1200/600, 0.1, 1000)

let renderer = new THREE.WebGLRenderer()
renderer.setSize(1200, 600)
stage.appendChild(renderer.domElement)

camera.position.z = 5

let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
hemiLight.color.setHSL(0.6, 1, 0.6)
hemiLight.groundColor.setHSL(0.095, 1, 0.75)
hemiLight.position.set(0, 50, 0)
scene.add(hemiLight)

let animate = function () {

    requestAnimationFrame(animate)

    renderer.render(scene, camera)

}

animate()




Component.namespace = 'info'

export let info = new (Component.define('Info', {

    start() {

        let pre = html.pre().appendTo(stage)

        this.setProps({ pre })

    },

    update() {

        let { pre } = this.props

        let object = {}

        for (let instance of Component.instances) {

            let k = instance.constructor.identifier

            k in object ? object[k]++ : object[k] = 1

        }

        let details = Object.entries(object).map(([name, count]) => name + ': ' + count).join('\n')

        pre.innerHTML = `n Component: ${Component.instances.size}\n\n` + details

    },

}))



Component.namespace = 'threeeeee'

export let SupaLight = Component.define('SupaLight', {

    static: {

        sphere: new THREE.SphereBufferGeometry(0.0625, 16, 8),

    },

    start(color = '#ff0040', { x = 0, y = 0, z = 0 } = {}, radius = 3, speed = 1) {

        let object3D = new THREE.Object3D()
        object3D.position.set(x, y, z)
        object3D.rotation.z = U.random(2 * Math.PI)
        scene.add(object3D)

        let light = new THREE.PointLight(color, 2, 50)
        light.position.set(radius, 0, 0)
        light.add(new THREE.Mesh(SupaLight.sphere, new THREE.MeshBasicMaterial({ color })))
        object3D.add(light)

        this.setProps({ object3D, light, radius, speed })

        info.forceUpdate()

    },

    update() {

        let { object3D, radius, speed } = this.props

        object3D.rotation.y += .05 * speed / radius

        return Component.DIRTY

    },

    onDestroy() {

        let { object3D } = this.props

        scene.remove(object3D)

        info.forceUpdate()

    },

})

new SupaLight()

export let SupaCube = Component.define('SupaCube', {

    start() {

        let geometry = new THREE.BoxGeometry(1, 1, 1)
        let material = new THREE.MeshPhongMaterial({ color: U.randomColor() })
        let cube = new THREE.Mesh(geometry, material)

        cube.position.x = U.random(-3, 3)
        cube.position.y = U.random(-3, 3)
        cube.position.z = U.random(-3, 3)

        let v = new THREE.Vector3(U.random(), 5 * U.random() ** 6, U.random(.5))

        scene.add(cube)

        this.setProps({ cube, v })

        info.forceUpdate()

    },

    update() {

        let { cube, v } = this.props

        let dt = 1/60

        cube.rotation.x += v.x * dt
        cube.rotation.y += v.y * dt
        cube.rotation.z += v.z * dt

        return Component.DIRTY

    },

    onDestroy() {

        let { cube } = this.props

        scene.remove(cube)

        info.forceUpdate()

    }

})



Component.namespace = 'ui'

export let Button = Component.define('Button', {

    start(label, onclick) {

        this.element = html.button.style({ height: '30px' })(label).appendTo(stage)
        this.element.onclick = onclick

    },

})

for (let i = 0; i < 100; i++)
    new SupaCube()

html.br().appendTo(stage)
new Button('CLEAR SupaCubes', () => SupaCube.all.destroy())
new Button('CLEAR SupaLights', () => SupaLight.all.destroy())
new Button('CLEAR  Both', () => SupaCube.all.union(SupaLight.all).destroy())

html.br().appendTo(stage)
new Button('new SupaCube()', () => new SupaCube)
new Button('new SupaLight({ random })', () => new SupaLight(U.randomColor(), U.randomXYZ(), U.random(1, 10), U.random()))
