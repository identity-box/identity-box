import React from 'react'
import Media from 'react-media'
import { getImage } from 'src/assets'
import { TextBox, Img2 } from 'src/components/ui-blocks'

const Box1Content2 = ({ data }) => (
  <>
    <Media query='(max-width: 1100px)'>
      {matches =>
        matches ? (
          <>
            <TextBox>
            Our sensitive personal data are kept by the state, healthcare organizations,
            financial institutions, and corporations. We do not have control over these
            data and our access to them is limited. Every institution storing the data
            has not only its own policies, but also uses proprietary technologies to
            access the data. These data silos make interoperbility hard and give
            institutions almost complete freedom to use the data without consenting the user.
            </TextBox>
            <Img2 src={getImage(data, 'CurrentSituation')} />
          </>
        ) : (
          <>
            <Img2 src={getImage(data, 'CurrentSituation')} />
            <TextBox css={{ width: '50%' }}>
            Our sensitive personal data are kept by the state, healthcare organizations,
            financial institutions, and corporations. We do not have control over these
            data and our access to them is limited. Every institution storing the data
            has not only its own policies, but also uses proprietary technologies to
            access the data. These data silos make interoperbility hard and give
            institutions almost complete freedom to use the data without consenting the user.
            </TextBox>
          </>
        )
      }
    </Media>
  </>
)

export { Box1Content2 }
