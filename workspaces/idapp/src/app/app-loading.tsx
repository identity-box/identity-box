import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { AppLoading } from '~/views/main'

export default function AppLoadingRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <AppLoading />
    </ErrorBoundary>
  )
}
