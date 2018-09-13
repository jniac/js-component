
// import Component from '../../src/Component.js'
// import Component from '../../build/Component.min.js'
import html from '../html.js'
import * as U from './utils.js'

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


export let Info = Component.Def({

    Component: 'Info',

    start() {

        let pre = html.pre().appendTo(stage)

        this.setProps({ pre })

    },

    update() {

        let { pre } = this.props

        pre.innerHTML = `n Component: ${Component.instances.size}`

    },

})

export let info = new Info()

let components = new Set()

export let SupaLight = Component.Def({

    Component: 'SupaLight',

    static: {



    },

    start(color = '#ff0040', { x = 0, y = 0, z = 0 } = {}, radius = 3, speed = 1) {

        components.add(this)

        let object3D = new THREE.Object3D()
        object3D.position.set(x, y, z)
        object3D.rotation.z = U.random(2 * Math.PI)
        scene.add(object3D)

        let light = new THREE.PointLight(color, 2, 50)
        light.position.set(radius, 0, 0)
        // light.add(new THREE.Mesh(SupaLight.sphere, new THREE.MeshBasicMaterial({ color })))
        light.add(new THREE.Mesh(new THREE.SphereBufferGeometry(0.0625, 16, 8), new THREE.MeshBasicMaterial({ color })))
        object3D.add(light)

        this.setProps({ object3D, light, radius, speed })

    },

    update() {

        let { object3D, radius, speed } = this.props

        object3D.rotation.y += .05 * speed / radius

        return true

    },

    destroy() {

        let { object3D } = this.props

        scene.remove(object3D)

        components.delete(this)

    },

})

new SupaLight()

export let SupaCube = Component.Def({

    Component: 'SupaCube',

    start() {

        components.add(this)

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

        return true

    },

    destroy() {

        let { cube } = this.props

        scene.remove(cube)

        info.forceUpdate()

        components.delete(this)

    }

})

for (let i = 0; i < 100; i++)
    new SupaCube()



html.br().appendTo(stage)

let fooButton = html.button.style({ height: '30px' })('new SupaCube()').appendTo(stage)

fooButton.onclick = () => new SupaCube()


let lightButton = html.button.style({ height: '30px' })('new SupaLight()').appendTo(stage)

lightButton.onclick = () => new SupaLight(U.randomColor(), U.randomXYZ(), U.random(1, 30), U.random())





let clearButton = html.button.style({ height: '30px' })('clear').appendTo(stage)

clearButton.onclick = () => {

    for (let c of components)
        c.destroy()

}
