import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import Home from '../../src/routes/home'

describe('Home', () => {
  beforeEach(() => {
    console.log = vi.fn()
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  it('has proper styling', async () => {
    const { container } = render(<Home />)
    expect(container).toMatchSnapshot()
    await screen.findByText(/^Connect\.\.\./i)
  })

  it('displays welcome text', async () => {
    render(<Home />)
    expect(
      screen.getByText(/Hush Hush needs to know two things/i)
    ).toBeInTheDocument()
    await screen.findByText(/^Connect\.\.\./i)
  })
})
