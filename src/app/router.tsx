import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { ExplorePage } from '../features/explore/ExplorePage'
import { PrayersPage } from '../features/prayers/PrayersPage'
import { QuranPage } from '../features/quran/QuranPage'
import { RootLayout } from './RootLayout'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/quran" replace /> },
      // One route for /quran, /quran/:surah and /quran/:surah/:ayah so the feed
      // stays mounted when jumping between verses.
      { path: 'quran/:surah?/:ayah?', element: <QuranPage /> },
      { path: 'prayers', element: <PrayersPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: '*', element: <Navigate to="/quran" replace /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
