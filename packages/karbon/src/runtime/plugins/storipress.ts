import type { ResourceID, Resources } from '../types'
import { useResourceResolver } from '../composables/resources'
import urls from '#build/storipress-urls.mjs'
import {
  abortNavigation,
  addRouteMiddleware,
  clearFillHistory,
  defineNuxtPlugin,
  defineNuxtRouteMiddleware,
  navigateTo,
  setResponseStatus,
  useRequestEvent,
  useRouter,
} from '#imports'

export const META_KEY = '__sp_page_meta'
const RESOURCE = new Set(Object.keys(urls))

const NOT_FOUND_TEXT = '<h1>Not Found</h1>'

function isResource(name: string): name is Resources {
  return RESOURCE.has(name)
}

const fetchMeta = defineNuxtRouteMiddleware(async (to) => {
  if (typeof to.name !== 'string' || !isResource(to.name)) {
    return
  }
  const event = useRequestEvent()
  const urlKey = to.name
  const { resolveFromID: resolveID, _getContextFor } = useResourceResolver()
  const ctx = _getContextFor(urlKey)
  const resourceID = urls[urlKey].getIdentity(to.params as Record<string, string>, ctx)
  const res = await resolveID(resourceID, to.params as Record<string, string>, to.meta.resourceName as string)
  if (!res) {
    return
  }

  event.context[META_KEY] = {
    type: resourceID.type,
    route: to.path,
    meta: res.meta,
  }
})

const abortIfNoMeta = defineNuxtRouteMiddleware(async () => {
  if (process.server) {
    const event = useRequestEvent()
    if (event.context[META_KEY] && event.context[META_KEY].meta !== NOT_FOUND_TEXT) {
      return
    }

    setResponseStatus(404)
    return abortNavigation()
  }
})

const storipressReset = defineNuxtRouteMiddleware(async () => {
  clearFillHistory()
})

const storipressRedirect = defineNuxtRouteMiddleware(async (to) => {
  const { resolveFromID } = useResourceResolver()
  const resourceID = { type: to.query.type, id: to.query.id } as ResourceID
  const res = await resolveFromID(resourceID)
  return navigateTo(res?.url)
})

export default defineNuxtPlugin(() => {
  const router = useRouter()
  if (process.server) {
    addRouteMiddleware('storipress-reset', storipressReset, { global: true })
    addRouteMiddleware('storipress-fetch-meta', fetchMeta, { global: true })
  } else {
    router.afterEach(() => {
      clearFillHistory()
    })
  }
  addRouteMiddleware('storipress-abort-if-no-meta', abortIfNoMeta)
  addRouteMiddleware('storipress-redirect', storipressRedirect)
})
