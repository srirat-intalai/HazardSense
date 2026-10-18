import { useQuery } from '@tanstack/react-query'
import type { DisasterEvent, DisasterListResponse } from '../types'

const eventsUrl =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=FL;EQ;TC;WF;VO;DR&alertlevel=green;orange;red'
const eventUrl = 'https://www.gdacs.org/gdacsapi/api/events/geteventdata'
const disasterStaleTime = 1000 * 60 * 5

async function loadEvents(): Promise<DisasterEvent[]> {
  const response = await fetch(eventsUrl)

  if (!response.ok) {
    throw new Error('โหลดรายการภัยพิบัติไม่สำเร็จ (HTTP ' + response.status + ')')
  }

  const result: DisasterListResponse = await response.json()
  return result.features
}

async function loadEvent(type: string, id: string): Promise<DisasterEvent> {
  const url = new URL(eventUrl)
  url.searchParams.set('eventtype', type)
  url.searchParams.set('eventid', id)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('โหลดรายละเอียดไม่สำเร็จ (HTTP ' + response.status + ')')
  }

  return response.json()
}

export function useDisasters() {
  return useQuery({
    queryKey: ['disasters'],
    queryFn: loadEvents,
    staleTime: disasterStaleTime,
  })
}

export function useDisasterDetail(
  type: string | undefined,
  id: string | undefined,
) {
  return useQuery({
    queryKey: ['disaster', type, id],
    queryFn: () => {
      if (!type || !id) {
        throw new Error('ไม่พบประเภทหรือรหัสเหตุการณ์')
      }

      return loadEvent(type, id)
    },
    enabled: Boolean(type && id),
    staleTime: disasterStaleTime,
  })
}
