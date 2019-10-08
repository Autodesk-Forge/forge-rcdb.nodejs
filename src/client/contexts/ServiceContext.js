import React from 'react'
import SocketSvc from 'SocketSvc'
import StorageSvc from 'StorageSvc'
import ModelSvc from 'ModelSvc'
import ExtractorSvc from 'ExtractorSvc'
import NotifySvc from 'NotifySvc'
import DialogSvc from 'DialogSvc'
import EventSvc from 'EventSvc'
import ForgeSvc from 'ForgeSvc'
import UserSvc from 'UserSvc'
import { client as config } from 'c0nfig'

const storageSvc = new StorageSvc({
  storageKey: 'Autodesk.Forge-RCDB.Storage',
  storageVersion: config.storageVersion
})

const socketSvc = new SocketSvc({
  host: config.host,
  port: config.port
})

const extractorSvc = new ExtractorSvc({
  apiUrl: '/api/extract'
})

const modelSvc = new ModelSvc({
  apiUrl: '/api/models'
})

const notifySvc = new NotifySvc()

const dialogSvc = new DialogSvc()

const eventSvc = new EventSvc()

const forgeSvc = new ForgeSvc({
  apiUrl: '/api/forge'
})

const userSvc = new UserSvc({
  apiUrl: '/api/user'
})

const Services = { socketSvc, storageSvc, extractorSvc, modelSvc, notifySvc, dialogSvc, eventSvc, forgeSvc, userSvc }
const ServiceContext = React.createContext(Services)
export { ServiceContext, Services }
