import { ListWithHeader } from '~/ui'

import { ListContainer } from './ui'

const AllIdentities = ({
  identityNames,
  peerIdentities,
  onSelectPeerIdentity,
  onSelectOwnIdentity
}) => {
  return (
    <>
      <ListContainer>
        <ListWithHeader
          data={
            identityNames.length > 0 ? identityNames : ['No identities yet!']
          }
          headerText='Your identities'
          onSelect={onSelectOwnIdentity}
          width='90%'
        />
      </ListContainer>
      <ListContainer>
        <ListWithHeader
          data={
            Object.keys(peerIdentities).length > 0
              ? Object.keys(peerIdentities)
              : ['No identities yet!']
          }
          headerText='Peer identities'
          onSelect={onSelectPeerIdentity}
          width='90%'
        />
      </ListContainer>
    </>
  )
}

export { AllIdentities }
