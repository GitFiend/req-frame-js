import {$Component} from './lib/components/custom-component'
import {Props} from './lib/components/types'

export type Meta = DomMeta | CustomMeta | string | null

export enum MetaKind {
  text,
  dom,
  custom,
  reaction,
}

export class DomMeta {
  kind = MetaKind.dom as const

  constructor(
    public name: string,
    public props: Props | null,
    public children: Meta[],
  ) {}
}

export class CustomMeta {
  kind = MetaKind.custom as const

  constructor(
    public name: Function,
    public props: Props,
    public children: Meta[],
  ) {}
}

// Could we look up the current tree instead of constructing again?
export function createElement(
  name: string | Function,
  props: Props | null,
  ...children: Meta[]
): Meta {
  if (typeof name === 'string') {
    return new DomMeta(name, props, children)
  } else {
    return new CustomMeta(name, props ?? {}, children)
  }
}

export class Fragment extends $Component<{}> {
  state = {}

  selectState(): {} {
    return {}
  }

  render() {
    return null
  }
}
