const path = require('path')

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	target: ['web'],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
	},
	
}