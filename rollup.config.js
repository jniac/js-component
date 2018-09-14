// import path from 'path'
import fs from 'fs'

function date() {

	let date = new Date()

	const f = n => n.toFixed().padStart(2, '0')
	const signed = n => n < 0 ? n.toString() : '+' + n.toString()

	let gmt = signed(-date.getTimezoneOffset() / 60)

	return date.getFullYear() + '-' + f(1 + date.getMonth()) + '-' + f(date.getDate()) + ' ' + f(date.getHours()) + ':' + f(date.getMinutes()) + ` GMT(${gmt})`

}

function license() {

	let str = fs.readFileSync('./LICENSE', 'utf8').trim().replace(/\n/g, '\n\t')

	return str

}

function banner() {

	return `

/*

	Component.js
	${date()}
	https://github.com/jniac/js-component

	${license()}

*/

`.trim() + '\n'

}

export default {
	input: './src/Component.js',
	plugins: [
		babel(),
	],
	// external: [path.resolve('./src/event.js')],
	// sourceMap: true,
	output: [
		// {
		// 	format: 'umd',
		// 	name: 'timeline',
		// 	file: 'build/timeline.bundle.js',
		// 	indent: '\t'
		// },
		{
			format: 'es',
			file: 'build/Component.js',
			// banner: banner(),
			indent: '\t'
		}
	]
}
