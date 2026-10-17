import { createBrowserRouter, Navigate } from 'react-router'
import { ExplorePage } from '../features/explore/ExplorePage'
import { PrayersPage } from '../features/prayers/PrayersPage'
import { QuranPage } from '../features/quran/QuranPage'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/quran" replace /> },
      { path: 'quran', element: <QuranPage /> },
      { path: 'quran/:surah/:ayah', element: <QuranPage /> },
      { path: 'prayers', element: <PrayersPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: '*', element: <Navigate to="/quran" replace /> },
    ],
  },
])
