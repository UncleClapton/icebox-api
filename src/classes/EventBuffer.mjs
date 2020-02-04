export default class EventBuffer {
  listeners = {}
  buffer = []
  isProcessing = false

  // Subscription Management

  subscribe (actionType, func) {
    if (!this.listeners[actionType]) {
      this.listeners[actionType] = {}
    }

    const funcRef = Symbol(actionType)

    this.listeners[actionType][funcRef] = func

    return funcRef
  }

  unsubscribe (actionType, funcRef) {
    if (this.listeners[actionType]) {
      delete this.listeners[actionType][funcRef]

      if (Object.keys(this.listeners[actionType]).length === 0) {
        delete this.listeners[actionType]
      }
    }
  }

  asListener (actionType) {
    return (target, prop, descriptor) => {
      this.subscribe(actionType, descriptor.value)
      descriptor.writable = false
    }
  }

  // Event Management

  async _callAllListeners (action) {
    const actionListeners = Object.values(this.listeners[action.type])

    // eslint-disable-next-line no-restricted-syntax
    for (let index = 0; index < actionListeners.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await actionListeners[index](action)
    }
  }

  async processBuffer () {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    while (this.buffer.length) {
      // eslint-disable-next-line no-await-in-loop
      await this._callAllListeners(this.buffer.shift())
    }

    this.isProcessing = false
  }

  dispatch (action) {
    if (!action.type) {
      throw new Error('Expected action.type to exist.')
    }

    if (this.listeners[action.type]) {
      this.buffer.push(action)
      this.processBuffer()
    }

    return action
  }
}
