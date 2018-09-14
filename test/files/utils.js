
export const FF = number => Math.round(0xff * number).toString(16).padStart(2, '0')

export const FFFFFF = (r, g, b) => '#' + FF(r) + FF(g) + FF(b)

export const randomFF = () => FF(Math.random())

export const randomColor = () => '#' + randomFF() + randomFF() + randomFF()

export const random = (min = 1, max) => {

    if (max === undefined)
        ([min, max] = [0, min])

    return min + (max - min) * Math.random()

}

export const randomXYZ = ({ max = 1, negative = true } = {}) => ({

    x: random(-max, max),
    y: random(-max, max),
    z: random(-max, max),

})
