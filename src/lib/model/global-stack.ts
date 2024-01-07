import {Custom} from '../components/custom-component'
import {Reaction} from './reactions'
import {DomComponent} from '../components/dom-component'
import {RootComponent} from '../components/root-component'
import {applyInserts} from '../render/order'

export class GlobalStack {
  private static componentRefs: WeakRef<Custom | Reaction>[] = []
  private static dirtyComponents = new Set<WeakRef<Custom | Reaction>>()

  static insertsStack = new Set<RootComponent | DomComponent>()

  static didMountStack = new Set<WeakRef<Custom>>()
  static didUpdateStack = new Set<WeakRef<Custom>>()

  static push(componentRef: WeakRef<Custom | Reaction>) {
    this.componentRefs.push(componentRef)
  }

  static pop() {
    this.componentRefs.pop()
  }

  static getCurrent(): WeakRef<Custom | Reaction> | null {
    return this.componentRefs[this.componentRefs.length - 1] ?? null
  }

  static markDirty(componentRef: WeakRef<Custom | Reaction>) {
    this.dirtyComponents.add(componentRef)

    this.queueRender()
  }

  private static queued = false
  private static queueRender(): void {
    if (this.queued) return

    this.queued = true
    this.renderList.length = 0
    this.renderedList.clear()

    requestAnimationFrame(this.drawFrame)
  }

  // We track which components have already updated this frame.
  // Components could update due to props changed, or runes.
  // We assume props updates will happen before rune updates.
  // If the component has updated due to props changed, we don't need to rerun
  static renderedList = new Set<Custom>()

  // Only used while rendering. We don't want to create a new array every time.
  private static readonly renderList: Custom[] = []
  private static readonly reactionList = new Set<Reaction>()

  static drawFrame = () => {
    console.time('reRender')
    const {renderList, renderedList, reactionList} = this

    for (const cRef of this.dirtyComponents.values()) {
      const c = cRef.deref()

      if (c) {
        if (c.kind === 'custom') {
          renderList.push(c)
        } else {
          reactionList.add(c)
        }
      }
    }

    while (reactionList.size > 0) {
      const reaction: Reaction = reactionList.values().next().value
      reactionList.delete(reaction)

      reaction.run()
    }

    // TODO: Check this
    renderList.sort((a, b) => a.order.localeCompare(b.order))

    for (const c of renderList) {
      if (!renderedList.has(c)) {
        c.update()
      }
    }

    for (const inserted of this.insertsStack) {
      applyInserts(inserted)
    }

    for (const cRef of this.didMountStack.values()) {
      const c = cRef.deref()
      if (c) c.componentDidMount()
    }
    this.didMountStack.clear()

    for (const cRef of this.didUpdateStack.values()) {
      const c = cRef.deref()
      if (c) c.componentDidUpdate()
    }
    this.didUpdateStack.clear()

    this.queued = false
    console.timeEnd('reRender')
  }
}
