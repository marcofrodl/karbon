import { gql } from '@apollo/client/core/index.js'
import { useStorage } from '@vueuse/core'
import { useSubscriberClient } from '../composables/subscriber-client'

type JSONValue = string | number | boolean | JSONObject | Array<JSONValue>

interface JSONObject {
  [x: string]: JSONValue
}

export type EventName = 'article.seen' | 'desk.seen' | 'tag.seen' | 'author.seen'

export interface TrackSubscriberActivityInput {
  data?: JSONObject | string
  name: EventName
  target_id?: string | null
}

const TrackMutation = gql`
  mutation Track($input: TrackSubscriberActivityInput!) {
    trackSubscriberActivity(input: $input)
  }
`

export async function track(input: TrackSubscriberActivityInput) {
  const token = useStorage('storipress-token', '')
  if (!token.value) {
    return true
  }

  if (typeof input.data === 'object' && input.data !== null) {
    input.data = JSON.stringify(input.data)
  }

  try {
    const client = useSubscriberClient()
    const { data } = await client.mutate({
      mutation: TrackMutation,
      variables: {
        input,
      },
    })

    return data.trackSubscriberActivity
  } catch {
    return false
  }
}
