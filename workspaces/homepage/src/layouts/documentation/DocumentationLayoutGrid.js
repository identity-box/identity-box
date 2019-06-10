import styled from '@emotion/styled'
import { rhythm } from 'src/utils/typography'
import { Grid } from '@react-frontend-developer/css-grid-helper'

let grid = new Grid([
  'sidebar content'
], {
  gridTemplateColumns: '300px calc(100vw - 350px)'
})

const DocumentationLayoutGrid = styled.div(grid.container, {
  boxSizing: 'border-box',
  margin: rhythm(1)
})

const SidebarGridItem = styled.div(grid.sidebar)
const ContentGridItem = styled.div(grid.content, { width: '100%', padding: '1rem' })

export { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem }
