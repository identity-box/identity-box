import React from 'react'
import { render } from '@testing-library/react'
import { IdAppQRCode } from './IdAppQRCode'

describe('IdAppQRCode', () => {
  const defaultTitle = 'IdApp QR Code'
  const title = 'Link in QR Code'
  const connectUrl = 'https://url-in-qr.code/'

  it('shows QR code with default title', () => {
    const { queryByText, queryByTitle } = render(<IdAppQRCode connectUrl={connectUrl} />)

    expect(queryByText(connectUrl)).not.toBeNull()
    expect(queryByTitle(defaultTitle).href).not.toBeNull()
  })

  it('links to the URL', () => {
    const { getByTitle } = render(<IdAppQRCode title={title} connectUrl={connectUrl} />)

    expect(getByTitle(title).href).toEqual(connectUrl)
  })
})
