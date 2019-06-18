import React from 'react'
import styled from '@emotion/styled'
import Media from 'react-media'
import { getImage } from 'src/assets'
import { Box, Row } from 'src/components/ui-blocks'

import { Box2Content1 } from './Box2Content1'
import { Box2Content2 } from './Box2Content2'

const NetworkGraphWrapper = styled.div({
  position: 'absolute',
  top: '0px'
},
({ position }) => ({
  ...position
}))

const NetworkGraph = ({ height, position, hideBottomPad }) => (
  <NetworkGraphWrapper position={position}>
    <div css={{
      width: '20px',
      height: '20px',
      backgroundColor: 'rgba(203, 165, 26, 0.8)'
    }} />
    <div css={{
      marginLeft: '8px',
      marginTop: '-10px',
      width: '4px',
      height,
      backgroundColor: 'rgba(203, 165, 26, 0.8)'
    }} />
    {!hideBottomPad && <div css={{
      marginTop: '-10px',
      width: '20px',
      height: '20px',
      backgroundColor: 'rgba(203, 165, 26, 0.8)'
    }} />}
  </NetworkGraphWrapper>
)

const Background = styled.div(({ imageUrl }) => ({
  position: 'absolute',
  width: '100%',
  height: '208%',
  zIndex: '10',
  top: '20px',
  left: '-70px',
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'auto 100%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  '@media (max-width: 1100px)': {
    backgroundImage: 'none'
  }
}))

const Box2 = ({ data }) => (
  <Box backgroundStyles={{
    position: 'relative',
    backgroundImage: 'linear-gradient(#5182BD, #0C3C52)',
    paddingTop: '150px',
    paddingBottom: '300px',
    '@media (max-width: 568px)': {
      paddingBottom: '250px'
    }
  }}>
    <Media query='(max-width: 1400px)'>
      {matches =>
        matches ? (
          <Background imageUrl={getImage(data, 'Network5')} />
        ) : (
          <Background imageUrl={getImage(data, 'Network4')} />
        )
      }
    </Media>
    <Media query='(min-width: 569px) and (max-width: 1100px)' render={() => (
      <NetworkGraph height='100px' />
    )} />
    <Row css={{
      justifyContent: 'flex-end',
      marginLeft: '50px',
      marginBottom: '150px',
      width: '60%',
      '@media (max-width: 1100px)': {
        marginLeft: '0px'
      },
      '@media (max-width: 568px)': {
        width: '90%',
        marginLeft: '0px'
      }
    }}>
      <Box2Content1 data={data} />
    </Row>
    <Media query='(min-width: 569px) and (max-width: 1100px)' render={() => (
      <NetworkGraph height='115px' position={{
        top: '250px'
      }} />
    )} />
    <Media query='(max-width: 568px)' render={() => (
      <NetworkGraph height='115px' position={{
        top: '150px'
      }} />
    )} />
    <Row css={{
      marginLeft: '50px',
      width: '60%',
      '@media (max-width: 568px)': {
        width: '90%',
        marginLeft: '0px'
      },
      '@media (max-width: 1100px)': {
        marginLeft: '0px'
      }
    }}>
      <Box2Content2 data={data} />
    </Row>
    <Media query='(max-width: 1100px)' render={() => (
      <>
        <NetworkGraph height='145px' hideBottomPad position={{
          top: '500px',
          '@media (max-width: 568px)': {
            top: '450px'
          },
          zIndex: 35
        }} />
        <div css={{
          position: 'absolute',
          zIndex: 30,
          top: '620px',
          width: '250px',
          height: '250px',
          '@media (max-width: 568px)': {
            top: '580px',
            width: '150px',
            height: '150px'
          },
          backgroundImage: `url(${getImage(data, 'IdBoxWithOneConnector')})`,
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }} />
      </>
    )} />
  </Box>
)

export { Box2 }
