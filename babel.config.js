module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '12.14',
      },
      shippedProposals: true,
    }],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-transform-strict-mode',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-default-from',
  ],
}
