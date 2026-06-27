import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ShareButton } from '../ShareButton'

describe('ShareButton', () => {
  it('renders a share control and a tweet intent link', () => {
    const { getByRole } = render(<ShareButton />)
    expect(getByRole('button').textContent).toMatch(/share/i)
    const link = getByRole('link') as HTMLAnchorElement
    expect(link.href).toContain('twitter.com/intent/tweet')
    expect(link.href).toContain('text=')
  })
})
