import React from 'react'
import { render, fireEvent, waitForElement } from '@testing-library/react'
import { IdAppConnector } from './IdAppConnector'

describe('IdApp Connector', () => {
  let telepathChannel

  beforeEach(() => {
    telepathChannel = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    }
  })

  describe('when closed', () => {
    let queryByText

    beforeEach(() => {
      const renderUtils = render(
        <IdAppConnector
          connectUrl='connectUrl'
          telepathChannel={telepathChannel}
        />
      )
      queryByText = renderUtils.queryByText
    })

    it('does not show the dialog', () => {
      expect(queryByText(/scan the qr code/i)).toBeNull()
    })

    it('does not subscribe', () => {
      expect(telepathChannel.subscribe).not.toHaveBeenCalled()
    })
  })

  describe('when open', () => {
    let getByText
    let container
    let onDone

    beforeEach(async () => {
      onDone = jest.fn()
      const renderUtils = render(
        <IdAppConnector
          connectUrl='connectUrl'
          telepathChannel={telepathChannel}
          onDone={onDone}
        />
      )
      getByText = renderUtils.getByText
      container = renderUtils.container

      fireEvent.click(getByText(/show qr code/i))
      await waitForElement(() => getByText(/connectUrl/i))
    })

    it('does show the dialog when opened', () => {
      expect(getByText(/scan the qr code/i)).toBeInTheDocument()
    })

    it('subscribes for notifications', async () => {
      expect(telepathChannel.subscribe).toHaveBeenCalled()
    })

    it('unsubscribes on unmount', () => {
      fireEvent.keyDown(container, { key: 'Escape', code: 27 })
      expect(telepathChannel.unsubscribe).toHaveBeenCalled()
    })

    describe('when telepath notification is received', () => {
      beforeEach(() => {
        const notification = { jsonrpc: '2.0', method: 'connectionSetupDone' }
        const onNotification =
          telepathChannel.subscribe.mock.calls[0][0]
        onNotification(notification)
      })

      it('fires onDone when telepath notification is received', () => {
        expect(onDone).toHaveBeenCalled()
      })

      it('unsubscribes from notifications', () => {
        expect(telepathChannel.unsubscribe).toHaveBeenCalled()
      })
    })
  })
})
