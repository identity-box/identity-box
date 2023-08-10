import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { ScanIdBox } from '~/views/main'

export default function ScanIdBoxRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <ScanIdBox />
    </ErrorBoundary>
  )
}
