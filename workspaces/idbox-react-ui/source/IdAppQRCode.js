import React from 'react'
import QRCode from 'qrcode.react'

const IdAppQRCode = ({ connectUrl, title = 'IdApp QR Code' }) => (
  <a href={connectUrl} title={title}>
    <QRCode value={connectUrl} />
  </a>
)

export { IdAppQRCode }
