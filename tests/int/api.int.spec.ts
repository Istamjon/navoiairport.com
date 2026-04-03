import { getPayload, Payload } from 'payload'
import config from '../../src/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    // Using the actual payload config file path
    payload = await getPayload({ config: await config })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})