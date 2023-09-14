const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		main: path.join(__dirname, "src/index.js"),
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].bundle.js",
		publicPath: "",
	},
	module: {
		rules: [
			{
				test: /.js/,
				exclude: /(node_modules)/,
				use: ["babel-loader"],
			},
			{
				test: /.s?css$/i,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader",
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [
									// Other plugins,
									[
										"postcss-preset-env",
										{
											browsers: "> 0.2% and not dead",
											stage: 3,
										},
									],
								],
							},
						},
					},
				],
			},
			{
				test: /.(png|svg|jpg|gif)$/,
				use: ["file-loader"],
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "./src/index.html"),
		}),
	],
	stats: "minimal",
	devtool: "source-map",
	mode: "development",
	devServer: {
		open: false,
		static: path.resolve(__dirname, "./dist"),
		port: 4000,
		historyApiFallback: {
			index: "index.html",
		},
	},
};
