import 'server-only'

import { createClient } from 'next-sanity'

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}

export function getSanityWriteClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2024-01-01'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) {
    throw new Error('Sanity project ID is not configured')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: getRequiredEnv('SANITY_API_TOKEN') || token,
  })
}
