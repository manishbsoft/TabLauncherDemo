import { useQuery } from '@tanstack/react-query'
import { mockApplications } from '../data/mockApplications.js'

async function loadApplications() {
  await new Promise((resolve) => window.setTimeout(resolve, 350))
  return mockApplications
}

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: loadApplications,
    staleTime: Infinity,
  })
}
