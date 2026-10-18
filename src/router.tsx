import { createBrowserRouter } from 'react-router'
import MainLayout from './layouts/MainLayout'
import DashboardPage, { About, AirQuality, SavedEvents } from './pages/DashboardPage'
import DisasterDetailPage from './pages/DisasterDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'saved',
        element: <SavedEvents />,
      },
      {
        path: 'air',
        element: <AirQuality />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {

        path: 'disaster/:type/:id',
        element: <DisasterDetailPage />,
      },
    ],
  },
])
