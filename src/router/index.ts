import { createRouter, createWebHashHistory } from 'vue-router'

const PlaceholderView = () => import('@/views/PlaceholderView.vue')

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: () => import('@/views/LandingView.vue') },
    { path: '/dashboard', redirect: '/dashboard/oggi' },
    { path: '/dashboard/oggi', name: 'today', component: () => import('@/views/TodayView.vue') },
    { path: '/dashboard/pesi/nuovo', name: 'weight-new', component: () => import('@/views/WeightLogFormView.vue') },
    { path: '/dashboard/pesi/:id/modifica', name: 'weight-edit', component: () => import('@/views/WeightLogFormView.vue') },
    { path: '/dashboard/cardio/nuovo', name: 'cardio-new', component: () => import('@/views/CardioLogFormView.vue') },
    { path: '/dashboard/cardio/:id/modifica', name: 'cardio-edit', component: () => import('@/views/CardioLogFormView.vue') },
    { path: '/dashboard/storico', name: 'history', component: () => import('@/views/HistoryView.vue') },
    { path: '/dashboard/storico/:date', name: 'history-day', component: () => import('@/views/HistoryDayView.vue') },
    { path: '/dashboard/riepilogo', name: 'summary', component: () => import('@/views/SummaryView.vue') },
    { path: '/dashboard/esercizi', name: 'exercises', component: () => import('@/views/ExercisesView.vue') },
    { path: '/dashboard/dati', name: 'data', component: () => import('@/views/DataView.vue') },
    { path: '/dashboard/impostazioni', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/dashboard/altro', name: 'more', component: () => import('@/views/MoreView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

export default router
