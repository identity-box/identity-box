import React, { useState } from 'react'
import { PageCentered, Centered, Spacer } from '@react-frontend-developer/react-layout-helpers'
import { Segment, Button, Icon, Header } from 'semantic-ui-react'

const Welcome = () => {
  const [ iconName, setIconName ] = useState('thumbs up')

  const onClick = () => {
    iconName === 'thumbs up'
      ? setIconName('thumbs up outline')
      : setIconName('thumbs up')
  }

  return (
    <PageCentered>
      <Segment raised css={{ width: '80%', minHeight: '254px', maxWidth: '500px' }}>
        <Centered>
          <Header as='h1'>Welcome</Header>
          <Icon name={iconName} size='massive' />
          <Spacer margin='30px 0 0 0'>
            <Button onClick={onClick} basic color='black'>Click Me!</Button>
          </Spacer>
        </Centered>
      </Segment>
    </PageCentered>
  )
}

export { Welcome }
