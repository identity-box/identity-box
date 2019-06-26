import React from 'react'
import { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem } from './DocumentationLayoutGrid'
import { Navigation } from 'src/confluenza/navigation'
import { SiteTitle } from './SiteTitle'

import { FixedNavigation } from './FixedNavigation'

const DocumentationLayoutWide = ({ children, location, data, onStateChanged, deltas }) => {
  const { site: { siteMetadata: { title } }, navigation: { docs } } = data
  return (
    <DocumentationLayoutGrid>
      <SidebarGridItem>
        <FixedNavigation>
          <SiteTitle title={title} />
          <Navigation docs={docs} location={location} onStateChanged={onStateChanged} deltas={deltas} />
        </FixedNavigation>
      </SidebarGridItem>
      <ContentGridItem>
        { children }
      </ContentGridItem>
    </DocumentationLayoutGrid>
  )
}

export { DocumentationLayoutWide }
