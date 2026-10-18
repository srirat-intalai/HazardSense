import { Link } from 'react-router'
import {
  alertBadge,
  alertText,
  showDate,
  typeIcon,
  typeName,
} from '../helpers'
import { makeKey, useWatchStore } from '../stores/useWatchStore'
import type { DisasterEvent } from '../types'

type DisasterCardProps = {
  event: DisasterEvent
}

export default function DisasterCard({ event }: DisasterCardProps) {
  const { watchList, toggleWatch } = useWatchStore()
  const details = event.properties
  const eventKey = makeKey(details.eventtype, details.eventid)
  const isWatching = watchList.includes(eventKey)
  const watchButtonClass = isWatching
    ? 'btn btn-sm btn-accent'
    : 'btn btn-sm btn-outline'
  const detailPath =
    '/disaster/' + details.eventtype + '/' + details.eventid

  return (
    <article className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          <img
            src={details.icon}
            alt={typeName(details.eventtype)}
            className="w-10 h-10"
          />

          <div className="flex-1">
            <h3 className="card-title text-base">{details.name}</h3>
            <p className="text-sm text-base-content/70">
              {typeIcon(details.eventtype)} {typeName(details.eventtype)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className={alertBadge(details.alertlevel)}>
            {alertText(details.alertlevel)}
          </span>

          {details.country !== '' && (
            <span className="badge badge-outline">{details.country}</span>
          )}
        </div>

        <p className="text-xs text-base-content/70 mt-2">
          เริ่ม: {showDate(details.fromdate)}
          <br />
          ถึง: {showDate(details.todate)}
        </p>

        <div className="card-actions justify-between items-center mt-3 pt-3 border-t border-base-200">
          <button
            onClick={() => toggleWatch(eventKey)}
            className={watchButtonClass}
          >
            {isWatching ? '★ ติดตามอยู่' : '☆ ติดตาม'}
          </button>

          <Link to={detailPath} className="link link-primary text-sm">
            ดูรายละเอียด →
          </Link>
        </div>
      </div>
    </article>
  )
}
