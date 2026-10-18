import { Link, useParams } from 'react-router'
import ErrorBox from '../components/ErrorBox'
import { alertBadge, alertText, showDate, typeIcon, typeName } from '../helpers'
import { useDisasterDetail } from '../hooks/useDisasters'
import { makeKey, useWatchStore } from '../stores/useWatchStore'

export default function DisasterDetailPage() {
  const { type, id } = useParams()
  const { data, isLoading, isError, error, refetch } = useDisasterDetail(type, id)
  const { watchList, toggleWatch } = useWatchStore()

  if (isLoading) {
    return <div className="skeleton h-96 w-full max-w-3xl mx-auto" />
  }

  if (isError || !data) {
    const message = error ? error.message : 'ไม่พบข้อมูลเหตุการณ์'

    return (
      <section className="space-y-3">
        <ErrorBox message={message} onRetry={refetch} />
        <div className="text-center">
          <Link to="/" className="btn btn-ghost">
            กลับหน้าหลัก
          </Link>
        </div>
      </section>
    )
  }

  const event = data.properties
  const savedKey = makeKey(event.eventtype, event.eventid)
  const isSaved = watchList.includes(savedKey)
  
  const coordinates = data.geometry.coordinates
  const longitude = coordinates[0]
  const latitude = coordinates[1]
  const mapUrl = 'https://www.google.com/maps?q=' + latitude + ',' + longitude
  const countries = event.affectedcountries
    .map((country) => country.countryname)
    .join(', ')

  return (
    <article className="card bg-base-100 shadow-xl border border-base-300 max-w-3xl mx-auto">
      <div className="card-body">
        <Link to="/" className="link link-primary">
          ← กลับหน้าหลัก
        </Link>

        <EventHeading
          name={event.name}
          icon={event.icon}
          eventType={event.eventtype}
        />

        <EventStatus
          alertLevel={event.alertlevel}
          isCurrent={event.iscurrent === 'true'}
        />

        <p>{event.htmldescription}</p>

        <EventDetails
          severity={event.severitydata.severitytext}
          countries={countries || event.country || '-'}
          startDate={showDate(event.fromdate)}
          endDate={showDate(event.todate)}
          latitude={latitude}
          longitude={longitude}
          mapUrl={mapUrl}
          source={event.source}
          eventId={event.eventid}
        />

        <div className="card-actions justify-between">
          <button
            className={isSaved ? 'btn btn-accent' : 'btn btn-primary'}
            onClick={() => toggleWatch(savedKey)}
          >
            {isSaved ? '★ ติดตามอยู่' : '☆ ติดตามเหตุการณ์นี้'}
          </button>

          <a
            href={event.url.report}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            อ่านรายงาน GDACS
          </a>
        </div>
      </div>
    </article>
  )
}

type EventHeadingProps = {
  name: string
  icon: string
  eventType: string
}

function EventHeading({ name, icon, eventType }: EventHeadingProps) {
  return (
    <div className="flex items-center gap-4 mt-2">
      <img src={icon} alt={typeName(eventType)} className="w-14 h-14" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">{name}</h1>
        <p>
          {typeIcon(eventType)} {typeName(eventType)}
        </p>
      </div>
    </div>
  )
}

type EventStatusProps = {
  alertLevel: Parameters<typeof alertBadge>[0]
  isCurrent: boolean
}

function EventStatus({ alertLevel, isCurrent }: EventStatusProps) {
  let statusText = 'สิ้นสุดแล้ว'
  if (isCurrent) {
    statusText = 'ยังเกิดอยู่'
  }

  return (
    <div className="flex gap-2">
      <span className={alertBadge(alertLevel)}>{alertText(alertLevel)}</span>
      <span className="badge">{statusText}</span>
    </div>
  )
}

type EventDetailsProps = {
  severity: string
  countries: string
  startDate: string
  endDate: string
  latitude: number
  longitude: number
  mapUrl: string
  source: string
  eventId: number
}

function EventDetails({
  severity,
  countries,
  startDate,
  endDate,
  latitude,
  longitude,
  mapUrl,
  source,
  eventId,
}: EventDetailsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <tbody>
          <tr>
            <th>ความรุนแรง</th>
            <td>{severity || '-'}</td>
          </tr>
          <tr>
            <th>ประเทศ</th>
            <td>{countries}</td>
          </tr>
          <tr>
            <th>เริ่ม</th>
            <td>{startDate}</td>
          </tr>
          <tr>
            <th>สิ้นสุด</th>
            <td>{endDate}</td>
          </tr>
          <tr>
            <th>พิกัด</th>
            <td>
              {latitude}, {longitude}
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary ml-2"
              >
                ดูแผนที่
              </a>
            </td>
          </tr>
          <tr>
            <th>แหล่งข้อมูล</th>
            <td>{source}</td>
          </tr>
          <tr>
            <th>รหัสเหตุการณ์</th>
            <td>{eventId}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
