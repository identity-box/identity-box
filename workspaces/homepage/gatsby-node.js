const path = require('path')

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions
  const markdownTemplate = path.resolve(`src/templates/markdownTemplate.js`)

  const queryResult = await graphql(`
    {
      allMarkdownRemark(
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `)

  if (queryResult.errors) {
    throw new Error(queryResult.errors)
  }

  queryResult.data.allMarkdownRemark.edges.forEach(({ node }) => {
    if (node.frontmatter.path) {
      createPage({
        path: node.frontmatter.path,
        component: markdownTemplate,
        context: {}
      })
    }
  })
}
