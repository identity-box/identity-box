import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Welcome } from '../../../components/welcome'

describe('Welcome', () => {
  it('has proper styling', () => {
    const { container } = render(<Welcome />)
    expect(container).toMatchSnapshot()
  })

  it('displays welcome text', () => {
    const { getByText } = render(<Welcome />)
    expect(getByText(/welcome/i)).toBeInTheDocument()
  })

  it('show the thumbs up outline icon when button is pressed', () => {
    const { container, getByText } = render(<Welcome />)

    const button = getByText(/click me/i)

    fireEvent.click(button)

    expect(container).toMatchSnapshot()
  })

  it('show the thumbs up icon again when button is pressed second time', () => {
    const { container, getByText } = render(<Welcome />)

    const button = getByText(/click me/i)

    fireEvent.click(button)
    fireEvent.click(button)

    expect(container).toMatchSnapshot()
  })
})
