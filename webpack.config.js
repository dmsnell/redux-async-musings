var webpack = require( 'webpack' );

module.exports = {
	entry: __dirname + '/index.jsx',
	output: {
		path: __dirname,
		filename: 'index.js'
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loaders: [ 'babel-loader' ]
			}
		]
	},
	// plugins: [
	// 	new webpack.ProvidePlugin( {
	// 		'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
	// 	} )
	// ],
	resolve: {
		modulesDirectories: [ '', 'node_modules' ],
		extensions: [ '', '.js', '.jsx' ]
	},
	devtool: 'source-map'
};