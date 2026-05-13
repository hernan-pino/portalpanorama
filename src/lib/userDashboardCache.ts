import { cache } from 'react'
import { container } from './container'

export const getUserDashboard = cache((userId: string) =>
  container.getGetUserDashboardUseCase().execute(userId),
)
