import { vi } from 'vitest'
import { screen, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdAppConnector } from './IdAppConnector'

vi.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value }) => <div>{value}</div>
}))

describe('IdApp Connector', () => {
  describe('when closed', () => {
    it('does not show the dialog', () => {
      render(
        <IdAppConnector
          rendezvousUrl='rendezvousUrl'
        />
      )
      expect(screen.queryByText(/scan the qr code/i)).toBeNull()
    })
  })

  describe('when open', () => {
    let onDone

    beforeEach(async () => {
      onDone = vi.fn()
    })

    it('does show the dialog when opened', async () => {
      const user = userEvent.setup()
      render(
        <IdAppConnector
          rendezvousUrl='rendezvousUrl'
          onDone={onDone}
        />
      )
      user.click(screen.getByText(/show qr code/i))
      await waitFor(() => expect(screen.getByText(/rendezvousUrl/i)).toBeInTheDocument())
      expect(screen.getByText(/scan the qr code/i)).toBeInTheDocument()
    })
  })
})
