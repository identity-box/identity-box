import 'jest-dom/extend-expect'
import '@testing-library/react/cleanup-after-each'

import { createSerializer } from 'jest-emotion'
import * as emotion from '@emotion/core'

expect.addSnapshotSerializer(createSerializer(emotion))
