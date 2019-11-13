import { noop } from './utils'
import { createEvent } from './createEvent'

type Handler<Params, Done> = (params: Params) => Promise<Done>
type Watcher<Params> = (params: Params) => void

export const createEffect = <Params = void, Done = void, Fail = Error>(
  effector?: Handler<Params, Done>
) => {
  let handler: Handler<Params, Done>
  if (effector) {
    handler = effector
  }
  let watcher: Watcher<Params> = noop

  const effect = (params: Params) => {
    watcher(params)
    return handler(params)
      .then(result => {
        effect.done({ result, params })
        return result
      })
      .catch(error => {
        effect.fail({ error, params })
        return error
      })
  }
  effect.watch = (cb: Watcher<Params>) => {
    watcher = cb
  }
  effect.done = createEvent<{ result: Done; params: Params }>()
  effect.fail = createEvent<{ error: Fail; params: Params }>()
  effect.use = (effector: Handler<Params, Done>) => {
    handler = effector
    return effect
  }

  return effect
}
