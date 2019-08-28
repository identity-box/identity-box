import React from 'react'
import { render } from '@testing-library/react'
import Home from '../../pages/index'

describe('index', () => {
  beforeEach(() => {
    process.env.serviceUrl = {
      test: 'http://localhost:3000'
    }
  })

  it('has proper styling', () => {
    const { container } = render(<Home />)
    expect(container).toMatchSnapshot()
  })

  it('displays welcome text', () => {
    const { getByText } = render(<Home />)
    expect(getByText(/Hush Hush needs to know two things/i)).toBeInTheDocument()
  })
})
