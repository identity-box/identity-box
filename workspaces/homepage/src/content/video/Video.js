import React from 'react'
import styled from '@emotion/styled'
import { Box, Row } from 'src/components/ui-blocks'
// eslint-disable-next-line import/no-webpack-loader-syntax
import Captions from 'file-loader!./IdentityBox-FOSDEM20-en.vtt'
// eslint-disable-next-line import/no-webpack-loader-syntax
import CaptionsPl from 'file-loader!./IdentityBox-FOSDEM20-pl.vtt'
// eslint-disable-next-line import/no-webpack-loader-syntax
import CaptionsRo from 'file-loader!./IdentityBox-FOSDEM20-ro.vtt'
import VideoPoster from './video_poster.jpg'

const Fallback = () => (
  <div css={{
    color: 'white',
    width: '80%'
  }}
  >
    <p>
      Here, you should see the video recording of our FOSDEM20 talk about Identity Box,
      but it looks like your browser does not support embedded videos.
    </p>
    <p>
      You can find the full recording of our talk at <a href='https://fosdem.org/2020/schedule/event/dip_identity_box/' alt='Link to FOSDEM20 page about Identity Box' target='_blank' rel='noopener noreferrer'>FOSDEM20 website</a>.
    </p>
  </div>
)

const Title = styled.p({
  margin: 0,
  fontFamily: 'Roboto Mono, monospace',
  color: 'white',
  fontSize: '1.1rem',
  marginBottom: '10px'
})

const P = styled.p({
  width: '80%',
  textAlign: 'center',
  fontSize: '0.7rem',
  lineHeight: '0.9rem',
  color: '#aaa',
  margin: 0
})

const Video = ({ data }) => (
  <Box>
    <Row css={{
      flexFlow: 'column nowrap'
    }}
    >
      <Title>
        Identity Box at FOSDEM 2020
      </Title>
      <P>
        Edited version with an extended transcript for the users with hearing impaired or
        when you want to watch the video in silent areas.
      </P>
      <P css={{ marginBottom: '28px' }}>
        The original recording can be accessed from the <a target='_blank' alt='Link to FOSDEM20 page about Identity Box' rel='noopener noreferrer' href='https://fosdem.org/2020/schedule/event/dip_identity_box/'>FOSDEM website</a>.
      </P>
      <video
        css={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          outline: 'none'
        }} controls width='80%' preload='metadata' poster={VideoPoster}
      >
        <source src='https://gateway.pinata.cloud/ipfs/QmbpqgXBCZtFrBqzjWEm1mTJWYkL4ze32JTjsEqaMzAhMH' type='video/webm' />
        <source src='https://gateway.pinata.cloud/ipfs/QmNV9VystxzqotyQaadmK1kk9JUpuuez2BtC72rwY141hj' type='video/mp4' />
        <track kind='captions' srcLang='en' src={Captions} />
        <track kind='captions' srcLang='pl' src={CaptionsPl} />
        <track kind='captions' srcLang='ro' src={CaptionsRo} />
        <Fallback />
      </video>
    </Row>
  </Box>
)

export { Video }
