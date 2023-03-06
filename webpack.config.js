module.exports = {
  mode: 'production',
  entry: '/ts/index.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: [".js", ".json", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  }
};