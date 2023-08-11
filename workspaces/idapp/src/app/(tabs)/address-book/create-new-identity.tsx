import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'
import { CreateNewIdentity } from '~/views/identity'

export default function CreateNewIdentityRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <CreateNewIdentity />
    </ErrorBoundary>
  )
}
