import React from 'react'
import { render } from '@testing-library/react'
import Home from '../../pages/index'

describe('index', () => {
  beforeEach(() => {
    process.env.serviceUrl = {
      test: 'http://localhost:3000'
    }
    console.log = jest.fn()
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  it('has proper styling', async () => {
    const { container, findByText } = render(<Home />)
    expect(container).toMatchSnapshot()
    await findByText(/^Connect\.\.\./i)
  })

  it('displays welcome text', async () => {
    const { getByText, findByText } = render(<Home />)
    expect(getByText(/Hush Hush needs to know two things/i)).toBeInTheDocument()
    await findByText(/^Connect\.\.\./i)
  })
})
