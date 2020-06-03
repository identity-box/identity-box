import { ServiceRegistry } from '../../source/services/ServiceRegistry'

import fs from 'fs-extra'
import path from 'path'

describe('ServiceRegistry', () => {
  const servicePath1 = 'service-registry.service-1'
  const servicePath2 = 'service-registry.service-2'

  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')
  const serializerFilePath = path.resolve(serializerFileDir, 'ServiceRegistry-Services.json')

  let serviceRegistry

  const prepareFixtureFile = () => {
    fs.ensureDirSync(serializerFileDir)
    fs.removeSync(serializerFilePath)
  }

  beforeEach(() => {
    prepareFixtureFile()
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
  })

  afterEach(() => {
    fs.removeSync(serializerFilePath)
  })

  it('does not have any services registred when created for the first time', () => {
    expect(serviceRegistry.services).toEqual([])
  })

  it('allows registering a new service endpoit', () => {
    serviceRegistry.register(servicePath1)

    expect(serviceRegistry.services).toEqual([servicePath1])
  })

  it('maintains the order of registered services in the returned array', () => {
    serviceRegistry.register(servicePath1)
    serviceRegistry.register(servicePath2)

    expect(serviceRegistry.services).toEqual([servicePath1, servicePath2])
  })

  describe('checking service path format', () => {
    const pathExists = Symbol('path exists')
    const noPath = Symbol('no path')
    const emptyPath = Symbol('empty path')
    const noServiceName = Symbol('no service name')
    const noServiceNamespace = Symbol('no service namespace')
    const tooManyPathComponents = Symbol('too many path components')

    const errors = {
      [pathExists]: 'Service with given path already exists!',
      [noPath]: 'Attemting to register a service without providing path!',
      [emptyPath]: 'Attemting to register a service with empty path!',
      [noServiceName]: 'Missing service name in path!',
      [noServiceNamespace]: 'Missing service namespace in path!',
      [tooManyPathComponents]: 'Too many service path components!'
    }

    it('throws when trying to register existing path', () => {
      const error = new Error(errors[pathExists])

      serviceRegistry.register(servicePath1)

      expect(() => serviceRegistry.register(servicePath1)).toThrow(error)
    })

    it('throws when path is not provided', () => {
      const error = new Error(errors[noPath])

      expect(() => serviceRegistry.register()).toThrow(error)
    })

    it('throws when path is provided but empty', () => {
      const error = new Error(errors[noPath])

      expect(() => serviceRegistry.register('')).toThrow(error)
    })

    it('throws when path does not include service name', () => {
      const error = new Error(errors[noServiceName])

      const serviceRegistry = new ServiceRegistry()

      expect(() => serviceRegistry.register('serviceNamespace')).toThrow(error)
      expect(() => serviceRegistry.register('serviceNamespace.')).toThrow(error)
    })

    it('throws when path does not include service namespace', () => {
      const error = new Error(errors[noServiceNamespace])

      expect(() => serviceRegistry.register('.serviceName')).toThrow(error)
    })

    it('throws when path includes too many path components', () => {
      const error = new Error(errors[tooManyPathComponents])

      expect(() => serviceRegistry.register('a.b.c.d')).toThrow(error)
    })
  })

  describe('preserving state', () => {
    const readSerializedState = () => {
      try {
        return JSON.parse(fs.readFileSync(serializerFilePath))
      } catch {
        return []
      }
    }

    beforeEach(() => {
      console.error = jest.fn()
    })

    afterEach(() => {
      console.error.mockRestore()
    })

    it('writes registered services to a file when adding a new service', () => {
      serviceRegistry.register(servicePath1)

      expect(readSerializedState()).toEqual(serviceRegistry.services)
    })

    it('writes more registered services to a file when adding a new service', () => {
      serviceRegistry.register(servicePath1)
      serviceRegistry.register(servicePath2)

      expect(readSerializedState()).toEqual(serviceRegistry.services)
    })

    it('restores previously registred services from a file', () => {
      const serializedState = [
        servicePath1,
        servicePath2
      ]
      fs.writeFileSync(serializerFilePath, JSON.stringify(serializedState))

      serviceRegistry = new ServiceRegistry({
        serializerFilePath
      })

      expect(serviceRegistry.services).toEqual(serializedState)
    })

    it('restores registred services to an empty list if file does not exist', () => {
      serviceRegistry = new ServiceRegistry({
        serializerFilePath
      })

      expect(serviceRegistry.services).toEqual([])
    })

    it('restores registred services to an empty list if file exists but is empty', () => {
      fs.ensureFileSync(serializerFilePath)

      serviceRegistry = new ServiceRegistry({
        serializerFilePath
      })

      expect(serviceRegistry.services).toEqual([])
    })

    it('restores registred services to an empty list if file exists and is empty list', () => {
      const serializedState = []
      fs.writeFileSync(serializerFilePath, JSON.stringify(serializedState))

      serviceRegistry = new ServiceRegistry({
        serializerFilePath
      })

      expect(serviceRegistry.services).toEqual([])
    })
  })
})
