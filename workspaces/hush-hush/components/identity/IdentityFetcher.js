// import { CogitoIdentity } from '@cogitojs/cogito-identity'

class IdentityFetcher {
  static get = channel => {
    // const requestedProperties = [
    //   CogitoIdentity.Property.EthereumAddress,
    //   CogitoIdentity.Property.Username
    // ]
    // const cogitoIdentity = new CogitoIdentity({ channel })
    // return cogitoIdentity.getInfo({ properties: requestedProperties })
    return {}
  }
}

export { IdentityFetcher }
