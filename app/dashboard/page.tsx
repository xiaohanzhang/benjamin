import { getDashboardData, getBlocksDashboardData, getCannonDashboardData, getAllDailyActivity } from '@/server/actions/game'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardPage() {
  const [mathData, blocksData, cannonData, dailyActivity] = await Promise.all([
    getDashboardData(),
    getBlocksDashboardData(),
    getCannonDashboardData(),
    getAllDailyActivity(),
  ])

  return (
    <DashboardShell
      mathData={mathData}
      blocksData={blocksData}
      cannonData={cannonData}
      dailyActivity={dailyActivity}
    />
  )
}
