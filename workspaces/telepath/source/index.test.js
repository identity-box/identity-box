import * as index from './index'
import * as main from './main'

it('exports the same things as index.js does', () => {
  expect(Object.keys(main)).toEqual(Object.keys(index))
})
