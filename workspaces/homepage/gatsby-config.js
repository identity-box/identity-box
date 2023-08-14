module.exports = {
  jsxRuntime: 'automatic',
  siteMetadata: {
    title: 'Identity Box',
    editBaseUrl: 'https://github.com/identity-box/identity-box/blob/master'
  },
  plugins: [
    {
      resolve: '@confluenza/gatsby-theme-confluenza',
      options: {
        mdx: true,
        ignore: ['**/dist/**', '**/ios/**']
      }
    },
    'gatsby-plugin-root-import'
  ]
}
