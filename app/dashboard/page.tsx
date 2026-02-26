import { getMathDashboardData, getBlocksDashboardData, getCannonDashboardData, getPhonicsDashboardData, getAllDailyActivity } from '@/server/actions/game'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardPage() {
  const [mathData, blocksData, cannonData, phonicsData, dailyActivity] = await Promise.all([
    getMathDashboardData(),
    getBlocksDashboardData(),
    getCannonDashboardData(),
    getPhonicsDashboardData(),
    getAllDailyActivity(),
  ])

  return (
    <DashboardShell
      mathData={mathData}
      blocksData={blocksData}
      cannonData={cannonData}
      phonicsData={phonicsData}
      dailyActivity={dailyActivity}
    />
  )
}
