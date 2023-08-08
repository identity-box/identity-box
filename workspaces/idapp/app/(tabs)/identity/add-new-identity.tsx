import { ErrorBoundary } from 'react-error-boundary'
import { Diagnostics } from '~/views/diagnostics'

import { AddNewIdentity } from '~/views/address-book'

export default function AddNewIdentityRoute() {
  return (
    <ErrorBoundary FallbackComponent={Diagnostics}>
      <AddNewIdentity />
    </ErrorBoundary>
  )
}
