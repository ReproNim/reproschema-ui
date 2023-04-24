module.exports = function(api) {
  api.cache(true);

  const presets = [
    '@vue/cli-plugin-babel/preset'
  ];

  const plugins = [];

  // Mock require.context() calls for jest to prevent crashes
  // https://stackoverflow.com/a/68297118
  if (process.env.NODE_ENV === 'test') {
    plugins.push('transform-require-context');
  }

  return {
    presets,
    plugins
  };
};
