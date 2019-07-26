// for some reason this does not work!
// import * as admin from 'firebase-admin'

const admin = require('firebase-admin')

class IPNSFirebase {
  static connect = () => {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: 'https://idbox-52fa6.firebaseio.com'
    })
  }

  static setIPNSRecord = async ({
    ipnsName,
    cid
  }) => {
    const db = admin.firestore()

    const docRef = db.collection('ipns').doc(ipnsName)
    const writeResult = await docRef.set({
      cid
    })
    return writeResult.writeTime.toDate().toISOString()
  }

  static getCIDForIPNSName = async ({
    ipnsName
  }) => {
    const db = admin.firestore()

    const docRef = db.collection('ipns').doc(ipnsName)
    const doc = await docRef.get()
    if (!doc.exists) {
      console.log(`No CID for IPNS name ${ipnsName}`)
      return undefined
    }
    const cid = doc.data().cid
    return cid
  }
}

export { IPNSFirebase }
