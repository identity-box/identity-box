module.exports = {
  siteMetadata: {
    title: 'Identity Box',
    editBaseUrl: 'https://github.com/identity-box/identity-box/blob/master'
  },
  plugins: [
    {
      resolve: '@confluenza/gatsby-theme-confluenza',
      options: {
        mdx: true
      }
    },
    'gatsby-plugin-emotion',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-root-import'
  ]
}
