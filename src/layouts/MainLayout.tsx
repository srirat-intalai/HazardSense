import { Link, NavLink, Outlet } from 'react-router'
import { useWatchStore } from '../stores/useWatchStore'

function menuClass({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return 'tab tab-active'
  }
  return 'tab'
}

export default function MainLayout() {
  const { watchList, airWatchList } = useWatchStore()
  const total = watchList.length + airWatchList.length

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <header className="navbar bg-base-100 shadow-md px-4 flex-wrap gap-2">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-extrabold">
            🚨 <span className="text-primary">HazardSense</span>
          </Link>
        </div>

        <nav role="tablist" className="tabs tabs-box flex-wrap">
          <NavLink to="/" end className={menuClass}>
            ภัยพิบัติ
          </NavLink>
          <NavLink to="/saved" className={menuClass}>
            ที่ติดตาม
            <span className="badge badge-primary badge-sm ml-2">{total}</span>
          </NavLink>
          <NavLink to="/air" className={menuClass}>
            ค่าฝุ่น PM2.5
          </NavLink>
          <NavLink to="/about" className={menuClass}>
            เกี่ยวกับเรา
          </NavLink>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Outlet = จุดที่หน้าลูกใน router มาแสดง (Dashboard หรือ Detail) */}
        <Outlet />
      </main>

      <footer className="footer footer-center bg-primary text-primary-content p-4 text-sm">
        <p>HazardSense · Mini Project 2 · ข้อมูลจาก GDACS และ Open-Meteo</p>
      </footer>
    </div>
  )
}
