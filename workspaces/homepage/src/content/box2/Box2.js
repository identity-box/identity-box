import React from 'react'
import styled from '@emotion/styled'
import Media from 'react-media'
import { getImage } from 'src/assets'
import { Box, Row } from 'src/components/ui-blocks'

import { Box2Content1 } from './Box2Content1'
import { Box2Content2 } from './Box2Content2'

const NetworkGraphWrapper = styled.div(({ position }) => ({
  position: 'relative',
  ...position
}))

const NetworkGraph = ({ height, position, hideBottomPad }) => (
  <NetworkGraphWrapper position={position}>
    <div css={{
      position: 'relative',
      width: '20px',
      height: '20px',
      zIndex: 1,
      backgroundColor: 'rgba(203, 165, 26, 0.7)'
    }} />
    <div css={{
      position: 'relative',
      zIndex: 0,
      marginLeft: '8px',
      marginTop: '-10px',
      width: '4px',
      height,
      backgroundColor: 'rgba(203, 165, 26, 0.8)'
    }} />
    {!hideBottomPad && <div css={{
      position: 'relative',
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
    paddingTop: '0px',
    '@media (min-width: 1100px)': {
      paddingTop: '150px'
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
      <NetworkGraph height='100px' position={{
        marginBottom: '20px'
      }} />
    )} />
    <Row css={{
      justifyContent: 'flex-end',
      marginBottom: '150px',
      marginLeft: '50px',
      width: '60%',
      '@media (max-width: 1100px)': {
        marginLeft: '0px',
        marginBottom: '-10px'
      },
      '@media (max-width: 568px)': {
        width: '90%',
        marginLeft: '0px',
        marginBottom: '-10px'
      }
    }}>
      <Box2Content1 data={data} />
    </Row>
    <Media query='(max-width: 1100px)' render={() => (
      <NetworkGraph height='100px' position={{
        marginBottom: '20px'
      }} />
    )} />
    <Row css={{
      marginLeft: '50px',
      marginBottom: '-10px',
      width: '60%',
      '@media (max-width: 568px)': {
        width: '90%',
        marginLeft: '0px'
      },
      '@media (max-width: 1100px)': {
        marginLeft: '0px'
      },
      '@media (min-width: 1100px)': {
        marginBottom: '300px'
      }
    }}>
      <Box2Content2 data={data} />
    </Row>
    <Media query='(max-width: 1100px)' render={() => (
      <>
        <NetworkGraph height='100px' hideBottomPad position={{
          zIndex: 35
        }} />
        <div css={{
          zIndex: 30,
          width: '250px',
          height: '250px',
          marginTop: '-25px',
          '@media (max-width: 568px)': {
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
