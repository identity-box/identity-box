import { render, screen } from '@testing-library/react'
import { IdAppQRCode } from './IdAppQRCode'
import { vi } from 'vitest'

vi.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value }) => <div>{value}</div>
}))

describe('IdAppQRCode', () => {
  const defaultTitle = 'IdApp QR Code'
  const title = 'Link in QR Code'
  const connectUrl = 'https://url-in-qr.code/'

  it('shows QR code with default title', () => {
    render(<IdAppQRCode connectUrl={connectUrl} />)

    expect(screen.queryByText(connectUrl)).not.toBeNull()
    expect(screen.queryByTitle(defaultTitle).href).not.toBeNull()
  })

  it('links to the URL', () => {
    render(<IdAppQRCode title={title} connectUrl={connectUrl} />)

    expect(screen.getByTitle(title).getAttribute('href')).toEqual(connectUrl)
  })
})
