import {Cottontail} from './render'
import {createElement} from '../create-element'

describe('render', () => {
  test('simple', () => {
    const req = new Cottontail(document.body)

    req.render(<div className="Omg" />)

    console.log(document.body.children)

    expect(document.body.children.length).toEqual(1)
  })
})
