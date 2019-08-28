import '@testing-library/jest-dom/extend-expect'
import { createSerializer } from 'jest-emotion'
import * as emotion from '@emotion/core'

expect.addSnapshotSerializer(createSerializer(emotion))
