import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router'
import DisasterCard from '../components/DisasterCard'
import ErrorBox from '../components/ErrorBox'
import { pmColor, pmLevel, typeName } from '../helpers'
import { useAirQuality, provinces } from '../hooks/useAirQuality'
import { useDisasters } from '../hooks/useDisasters'
import { makeKey, useWatchStore } from '../stores/useWatchStore'
import type { AirQualityResult, DisasterEvent } from '../types'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardBanner />
      <EventList />
    </div>
  )
}

function DashboardBanner() {
  return (
    <section className="rounded-box bg-primary text-primary-content p-6 md:p-10 shadow-md">
      <h1 className="text-3xl md:text-5xl font-bold">HazardSense</h1>
      <p className="mt-2 md:text-lg">
        ติดตามภัยพิบัติและค่าฝุ่น PM2.5 ในหน้าเดียว
      </p>
    </section>
  )
}

function EventList() {
  const { data, isLoading, isError, error, refetch } = useDisasters()
  const [keyword, setKeyword] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')

  if (isLoading) {
    return <LoadingCards />
  }

  if (isError) {
    return <ErrorBox message={error.message} onRetry={refetch} />
  }

  const events = data || []
  const searchText = keyword.toLowerCase().trim()
  const visibleEvents = events
    .filter((event) => matchesEvent(event, selectedType, searchText))
    .sort(sortByDate)
  const eventCards = visibleEvents.map(renderEventCard)

  let eventResults
  if (eventCards.length === 0) {
    eventResults = <p className="alert">ไม่พบเหตุการณ์ที่ตรงกับที่ค้นหา</p>
  } else {
    eventResults = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {eventCards}
      </div>
    )
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">ภัยพิบัติที่กำลังเกิดทั่วโลก</h2>
        <p className="text-base-content/70">
          ข้อมูลจาก GDACS {events.length} เหตุการณ์
        </p>
      </div>

      <EventFilters
        keyword={keyword}
        selectedType={selectedType}
        eventCount={events.length}
        onKeywordChange={setKeyword}
        onTypeChange={setSelectedType}
        events={events}
      />

      {eventResults}
    </section>
  )
}

type EventFiltersProps = {
  keyword: string
  selectedType: string
  eventCount: number
  events: DisasterEvent[]
  onKeywordChange: (value: string) => void
  onTypeChange: (value: string) => void
}

function EventFilters({
  keyword,
  selectedType,
  eventCount,
  events,
  onKeywordChange,
  onTypeChange,
}: EventFiltersProps) {
  function handleKeywordChange(event: ChangeEvent<HTMLInputElement>) {
    onKeywordChange(event.target.value)
  }

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    onTypeChange(event.target.value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-base-100 p-4 rounded-box shadow-sm border border-base-300">
      <input
        className="input w-full sm:flex-1"
        placeholder="ค้นหาชื่อเหตุการณ์หรือประเทศ"
        value={keyword}
        onChange={handleKeywordChange}
      />

      <select
        className="select w-full sm:w-64"
        value={selectedType}
        onChange={handleTypeChange}
      >
        <option value="ALL">ทุกประเภท ({eventCount})</option>
        <option value="FL">น้ำท่วม ({countEvents(events, 'FL')})</option>
        <option value="EQ">แผ่นดินไหว ({countEvents(events, 'EQ')})</option>
        <option value="TC">พายุหมุนเขตร้อน ({countEvents(events, 'TC')})</option>
        <option value="WF">ไฟป่า ({countEvents(events, 'WF')})</option>
        <option value="VO">ภูเขาไฟ ({countEvents(events, 'VO')})</option>
        <option value="DR">ภัยแล้ง ({countEvents(events, 'DR')})</option>
      </select>
    </div>
  )
}

function matchesEvent(event: DisasterEvent, selectedType: string, searchText: string) {
  const details = event.properties
  const correctType = selectedType === 'ALL' || details.eventtype === selectedType
  const nameAndCountry = (details.name + ' ' + details.country).toLowerCase()

  return correctType && nameAndCountry.includes(searchText)
}

function countEvents(events: DisasterEvent[], type: string): number {
  return events.filter((event) => event.properties.eventtype === type).length
}

function sortByDate(first: DisasterEvent, second: DisasterEvent): number {
  return second.properties.fromdate.localeCompare(first.properties.fromdate)
}

function renderEventCard(event: DisasterEvent) {
  const details = event.properties
  const eventKey = makeKey(details.eventtype, details.eventid)

  return <DisasterCard key={eventKey} event={event} />
}

export function SavedEvents() {
  const {
    watchList,
    toggleWatch,
    clearWatch,
    airWatchList,
  } = useWatchStore()
  const { data, isLoading, isError, error, refetch } = useDisasters()

  if (watchList.length === 0 && airWatchList.length === 0) {
    return <EmptySavedList />
  }

  let disasterSection
  if (watchList.length > 0) {
    if (isLoading) {
      disasterSection = <LoadingCards />
    } else if (isError) {
      disasterSection = <ErrorBox message={error.message} onRetry={refetch} />
    } else {
      const events = data || []
      const savedEvents = watchList
        .map((key) => findSavedEvent(events, key))
        .filter((event): event is DisasterEvent => event !== undefined)
      const savedCards = savedEvents.map(renderEventCard)
      const missingKeys = watchList.filter(
        (key) => findSavedEvent(events, key) === undefined,
      )
      const missingRows = missingKeys.map((key) =>
        renderMissingEvent(key, toggleWatch),
      )

      disasterSection = (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">ภัยพิบัติ ({watchList.length})</h2>
              <p className="text-base-content/70">เหตุการณ์ที่บันทึกไว้ในเครื่องนี้</p>
            </div>

            <button
              className="btn btn-outline btn-error btn-sm"
              onClick={clearWatch}
            >
              ลบภัยพิบัติทั้งหมด
            </button>
          </div>

          {savedCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedCards}
            </div>
          )}

          {missingRows.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">เหตุการณ์ที่ไม่อยู่ในรายการล่าสุด</h3>
              {missingRows}
            </div>
          )}
        </section>
      )
    }
  }

  return (
    <section className="space-y-5">
      {disasterSection}
      <SavedAirQuality />
    </section>
  )
}

function EmptySavedList() {
  return (
    <section className="text-center py-12 bg-base-100 rounded-box">
      <h2 className="text-2xl font-bold">ยังไม่มีรายการที่ติดตามไว้</h2>
      <p className="text-base-content/70 mt-2">
        กดปุ่มติดตามบนการ์ดภัยพิบัติหรือค่าฝุ่นเพื่อบันทึกไว้
      </p>
    </section>
  )
}

function SavedAirQuality() {
  const { airWatchList, toggleAirWatch, clearAirWatch } = useWatchStore()
  const { data, isLoading, isError, error, refetch } = useAirQuality()

  if (airWatchList.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">ค่าฝุ่น PM2.5 ({airWatchList.length})</h2>
        <div className="skeleton h-40 w-full" />
      </section>
    )
  }

  if (isError || !data) {
    const message = error ? error.message : 'ไม่มีข้อมูลค่าฝุ่น'
    return <ErrorBox message={message} onRetry={refetch} />
  }

  const rows = makeAirQualityRows(data).filter((row) =>
    airWatchList.includes(row.id),
  )
  const savedAirCards = rows.map((row) =>
    renderAirCard(row, airWatchList, toggleAirWatch),
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">ค่าฝุ่น PM2.5 ({airWatchList.length})</h2>
          <p className="text-base-content/70">จังหวัดที่บันทึกไว้ในเครื่องนี้</p>
        </div>

        <button
          className="btn btn-outline btn-error btn-sm"
          onClick={clearAirWatch}
        >
          ลบค่าฝุ่นทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {savedAirCards}
      </div>
    </section>
  )
}

function findSavedEvent(events: DisasterEvent[], key: string) {
  return events.find((event) => {
    const details = event.properties
    return makeKey(details.eventtype, details.eventid) === key
  })
}

function renderMissingEvent(key: string, removeFromSaved: (key: string) => void) {
  const [type, id] = key.split('-')
  const detailPath = '/disaster/' + type + '/' + id

  return (
    <div
      key={key}
      className="flex flex-wrap items-center gap-3 bg-base-100 p-3 rounded-box"
    >
      <span>{typeName(type)} รหัส {id}</span>
      <Link to={detailPath} className="link link-primary">
        ดูรายละเอียด
      </Link>
      <button
        className="btn btn-ghost btn-xs"
        onClick={() => removeFromSaved(key)}
      >
        เลิกติดตาม
      </button>
    </div>
  )
}

export function AirQuality() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAirQuality()
  const { airWatchList, toggleAirWatch } = useWatchStore()

  if (isLoading) {
    return <div className="skeleton h-64 w-full" />
  }

  if (isError || !data) {
    const message = error ? error.message : 'ไม่มีข้อมูลค่าฝุ่น'
    return <ErrorBox message={message} onRetry={refetch} />
  }

  const rows = makeAirQualityRows(data)
  rows.sort(sortByPmLevel)
  const updatedAt = getUpdatedTime(rows)
  const airCards = rows.map((row) =>
    renderAirCard(row, airWatchList, toggleAirWatch),
  )
  const refreshLabel = isFetching ? 'กำลังโหลด...' : 'โหลดค่าล่าสุด'

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">ค่าฝุ่น PM2.5 รายจังหวัด</h2>
          <p className="text-base-content/70">อัปเดต {updatedAt} เวลาไทย</p>
        </div>

        <button
          className="btn btn-sm btn-outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {refreshLabel}
        </button>
      </div>

      <p role="alert" className="alert alert-warning text-sm">
        ค่าจากแบบจำลอง CAMS ผ่าน Open-Meteo ไม่ใช่ค่าจากสถานีวัดจริง
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {airCards}
      </div>
    </section>
  )
}

type AirRow = {
  id: number
  name: string
  pm25: number | null
  pm10: number | null
  aqi: number | null
  time: string
}

function makeAirQualityRows(readings: AirQualityResult[]): AirRow[] {
  return provinces.map((province, index) => {
    const reading = readings[index]

    if (!reading) {
      return {
        id: province.id,
        name: province.name,
        pm25: null,
        pm10: null,
        aqi: null,
        time: '',
      }
    }

    return {
      id: province.id,
      name: province.name,
      pm25: reading.current.pm2_5,
      pm10: reading.current.pm10,
      aqi: reading.current.us_aqi,
      time: reading.current.time,
    }
  })
}

function sortByPmLevel(first: AirRow, second: AirRow): number {
  return (second.pm25 ?? -1) - (first.pm25 ?? -1)
}

function getUpdatedTime(rows: AirRow[]): string {
  if (rows.length === 0) {
    return '-'
  }
  return rows[0].time.replace('T', ' ')
}

function renderAirCard(
  row: AirRow,
  airWatchList: number[],
  toggleAirWatch: (id: number) => void,
) {
  const cardClass = 'card shadow-md ' + pmColor(row.pm25)
  const pmValue = row.pm25 === null ? '-' : row.pm25
  const pm10 = row.pm10 === null ? '-' : row.pm10
  const aqi = row.aqi === null ? '-' : row.aqi
  const isWatching = airWatchList.includes(row.id)
  let buttonClass = 'btn btn-sm btn-outline'
  let buttonText = '☆ ติดตาม'

  if (isWatching) {
    buttonClass = 'btn btn-sm btn-accent'
    buttonText = '★ ติดตามอยู่'
  }

  return (
    <article key={row.id} className={cardClass}>
      <div className="card-body p-4">
        <h3 className="font-semibold">{row.name}</h3>
        <p className="text-3xl font-bold">
          {pmValue}
          <span className="text-sm font-normal"> µg/m³</span>
        </p>
        <p>{pmLevel(row.pm25)}</p>
        <p className="text-xs">PM10: {pm10} · US AQI: {aqi}</p>
        <button
          className={buttonClass}
          onClick={() => toggleAirWatch(row.id)}
        >
          {buttonText}
        </button>
      </div>
    </article>
  )
}

type TeamMember = {
  id: string
  name: string
  nickname: string
  image: string
  work: string
}

const teamMembers: TeamMember[] = [
  {
    id: '1660701283',
    name: 'นายชินวัตร อ่วมแก้ว',
    nickname: 'ฟิว',
    image: '/images/member1660701283.png',
    work: 'เชื่อมต่อ GDACS และ Open-Meteo, ทำ TanStack Query hooks, กำหนด TypeScript types, หน้ารายละเอียด และหน้าค่าฝุ่น PM2.5',
  },
  {
    id: '1660705185',
    name: 'นางสาวศรีรัตน์ อินทลัย',
    nickname: 'หยก',
    image: '/images/member1660705185.jpg',
    work: 'ออกแบบ UI และ Layout, หน้าค้นหาและกรอง, ระบบติดตามด้วย Zustand, หน้า About และทดสอบ Responsive',
  },
]

export function About() {
  const memberCards = teamMembers.map(renderTeamMember)

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">เกี่ยวกับ HazardSense</h2>
        <p className="text-base-content/70">
          เว็บติดตามภัยพิบัติและคุณภาพอากาศ สำหรับ Mini Project 2 วิชา CS319
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memberCards}
      </div>

      <DataSources />
    </section>
  )
}

function renderTeamMember(member: TeamMember) {
  return (
    <article
      key={member.id}
      className="card bg-base-100 border border-base-300 shadow-sm"
    >
      <div className="card-body items-center text-center">
        <img
          src={member.image}
          alt={member.name}
          className="w-32 h-32 rounded-full object-cover"
        />
        <h3 className="card-title">{member.name}</h3>
        <p>ชื่อเล่น {member.nickname} · รหัส {member.id}</p>
        <p className="text-sm text-base-content/70">{member.work}</p>
      </div>
    </article>
  )
}

function DataSources() {
  return (
    <section className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h3 className="card-title">แหล่งข้อมูล</h3>
        <p>
          ภัยพิบัติ:
          <a className="link link-primary ml-2" href="https://www.gdacs.org/">
            GDACS
          </a>
          <a
            className="link link-primary ml-2"
            href="https://www.gdacs.org/gdacsapi/swagger/index.html"
          >
            เอกสาร API
          </a>
        </p>
        <p>
          คุณภาพอากาศ:
          <a
            className="link link-primary ml-2"
            href="https://open-meteo.com/en/docs/air-quality-api"
          >
            Open-Meteo Air Quality API
          </a>
          <span className="ml-2">ข้อมูลแบบจำลอง CAMS (CC BY 4.0)</span>
        </p>
      </div>
    </section>
  )
}

function LoadingCards() {
  const placeholders = [1, 2, 3, 4]
  const cards = placeholders.map(renderLoadingCard)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards}
    </div>
  )
}

function renderLoadingCard(number: number) {
  return <div key={number} className="skeleton h-56 w-full" />
}
