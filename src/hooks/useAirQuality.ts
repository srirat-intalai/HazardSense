import { useQuery } from '@tanstack/react-query'
import type { AirQualityResult, Province } from '../types'

export const provinces: Province[] = [
  { id: 1, name: 'กรุงเทพมหานคร', lat: 13.75, lon: 100.5 },
  { id: 2, name: 'ปทุมธานี', lat: 14.02, lon: 100.53 },
  { id: 3, name: 'พระนครศรีอยุธยา', lat: 14.35, lon: 100.57 },
  { id: 4, name: 'ชลบุรี', lat: 13.36, lon: 100.98 },
  { id: 5, name: 'ระยอง', lat: 12.68, lon: 101.28 },
  { id: 6, name: 'กาญจนบุรี', lat: 14.02, lon: 99.53 },
  { id: 7, name: 'นครสวรรค์', lat: 15.7, lon: 100.14 },
  { id: 8, name: 'พิษณุโลก', lat: 16.82, lon: 100.26 },
  { id: 9, name: 'เชียงใหม่', lat: 18.79, lon: 98.98 },
  { id: 10, name: 'เชียงราย', lat: 19.91, lon: 99.83 },
  { id: 11, name: 'ลำปาง', lat: 18.29, lon: 99.49 },
  { id: 12, name: 'น่าน', lat: 18.78, lon: 100.78 },
  { id: 13, name: 'แม่ฮ่องสอน', lat: 19.3, lon: 97.97 },
  { id: 14, name: 'ขอนแก่น', lat: 16.44, lon: 102.83 },
  { id: 15, name: 'อุดรธานี', lat: 17.41, lon: 102.79 },
  { id: 16, name: 'นครราชสีมา', lat: 14.97, lon: 102.1 },
  { id: 17, name: 'อุบลราชธานี', lat: 15.24, lon: 104.85 },
  { id: 18, name: 'สุราษฎร์ธานี', lat: 9.14, lon: 99.33 },
  { id: 19, name: 'ภูเก็ต', lat: 7.88, lon: 98.39 },
  { id: 20, name: 'สงขลา (หาดใหญ่)', lat: 7.01, lon: 100.47 },
]

const airQualityUrl =
  'https://air-quality-api.open-meteo.com/v1/air-quality'
const airQualityStaleTime = 1000 * 60 * 10

async function loadAirQuality(): Promise<AirQualityResult[]> {
  const latitudes = provinces.map((province) => province.lat).join(',')
  const longitudes = provinces.map((province) => province.lon).join(',')
  const url = new URL(airQualityUrl)

  url.searchParams.set('latitude', latitudes)
  url.searchParams.set('longitude', longitudes)
  url.searchParams.set('current', 'pm2_5,pm10,us_aqi')
  url.searchParams.set('timezone', 'Asia/Bangkok')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('โหลดค่าฝุ่นไม่สำเร็จ (HTTP ' + response.status + ')')
  }

  return response.json()
}

export function useAirQuality() {
  return useQuery({
    queryKey: ['air-quality'],
    queryFn: loadAirQuality,
    staleTime: airQualityStaleTime,
  })
}
