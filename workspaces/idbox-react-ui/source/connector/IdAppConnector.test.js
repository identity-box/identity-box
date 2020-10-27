import React from 'react'
import { render, fireEvent, waitForElement } from '@testing-library/react'
import { IdAppConnector } from './IdAppConnector'

describe('IdApp Connector', () => {
  describe('when closed', () => {
    let queryByText

    beforeEach(() => {
      const renderUtils = render(
        <IdAppConnector
          rendezvousUrl='rendezvousUrl'
        />
      )
      queryByText = renderUtils.queryByText
    })

    it('does not show the dialog', () => {
      expect(queryByText(/scan the qr code/i)).toBeNull()
    })
  })

  describe('when open', () => {
    let getByText
    let onDone

    beforeEach(async () => {
      onDone = jest.fn()
      const renderUtils = render(
        <IdAppConnector
          rendezvousUrl='rendezvousUrl'
          onDone={onDone}
        />
      )
      getByText = renderUtils.getByText

      fireEvent.click(getByText(/show qr code/i))
      await waitForElement(() => getByText(/rendezvousUrl/i))
    })

    it('does show the dialog when opened', () => {
      expect(getByText(/scan the qr code/i)).toBeInTheDocument()
    })
  })
})
