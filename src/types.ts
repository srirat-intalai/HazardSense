export type DisasterType = 'FL' | 'EQ' | 'TC' | 'WF' | 'VO' | 'DR'
export type AlertLevel = 'Green' | 'Orange' | 'Red'

export type DisasterEvent = {
  geometry: {
    coordinates: number[]
  }
  properties: {
    eventtype: DisasterType
    eventid: number
    name: string
    htmldescription: string
    icon: string
    alertlevel: AlertLevel
    country: string
    fromdate: string
    todate: string
    iscurrent: string
    source: string
    affectedcountries: AffectedCountry[]
    severitydata: SeverityData
    url: EventUrls
  }
}

export type AffectedCountry = {
  countryname: string
}

export type SeverityData = {
  severitytext: string
}

export type EventUrls = {
  report: string
}

export type DisasterListResponse = {
  features: DisasterEvent[]
}

export type Province = {
  id: number
  name: string
  lat: number
  lon: number
}

export type AirQualityResult = {
  current: {
    time: string
    pm2_5: number | null
    pm10: number | null
    us_aqi: number | null
  }
}
