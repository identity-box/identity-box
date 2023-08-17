import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { IdBoxKeyNaming } from '~/views/migrations'

export default function FirstIdentityRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <IdBoxKeyNaming />
    </ErrorBoundary>
  )
}
