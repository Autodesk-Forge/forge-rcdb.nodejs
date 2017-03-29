/////////////////////////////////////////////////////////////////
// Configurator Extension
// By Philippe Leefsma, February 2016
//
/////////////////////////////////////////////////////////////////
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import HotSpotPropertyPanel from './Predix.HotSpot.PropertyPanel'
import ExtensionBase from 'Viewer.ExtensionBase'
import PredixPopover from './Predix.Popover'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'

// React Stuff
import WidgetContainer from 'WidgetContainer'
import IoTGraph from './IoTGraph'
import React from 'react'
import './Data.scss'

// Commands
import HotSpotCommand from 'HotSpot.Command'


const hotspots = [

  {
    controlled: true, //controlled by IoT sensor
    id: 1,
    dbId: 17445,
    isolateIds:[17438],
    tags:['#534771', '#531224', '#633153'],
    occlusion: true,
    name: '# 447686',
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: -179.28960183912318,
      y: 1056.8737077328178,
      z: -1008.0699462890627
    },
    tooltip: {
      class: 'predix',
      caption: 'Click to display data ...'
    },
    viewerState: {
      "viewport":{
        "eye":[877.4387496550687,2565.4644974917273,-269.870042761029],
        "target":[108.34943471133556,1609.9067575254103,-879.1839843569803],
        "up":[-0.27893924369688833,-0.34656905006463834,0.8955907502107768],
        "worldUpVector":[0,0,1],
        "pivotPoint":[-624.2797737121582,1045.4132385253906,-1183.1013793945312],
        "distanceToOrbit":2310.0586146018372,
        "aspectRatio":1.3713548772169168,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":44.99999100695533
      }
    },
    properties: [
      {
        name: 'Incident #',
        value: '447686',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Part/Model Number',
        value: 'WT000201',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Geo Location',
        value: '11.224.3467',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Deployment Date',
        value: '11/9/17',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Design Revision',
        value: 'A',
        category: 'Asset',
        dataType: 'text'
      },

      {
        name: 'Customer Name',
        value: 'Crest Unlimited',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order#',
        value: '65038',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order Date',
        value: '9/6/16',
        category: 'Sales',
        dataType: 'text'
      },

      {
        name: 'Plant',
        value: '002 (Atlanta)',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Work Order',
        value: '324905',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Start Date',
        value: '8/3/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'End Date',
        value: '9/5/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Part Number',
        value: 'WT000202*912038',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Serial #',
        value: 'SNT000005',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Cost',
        value: '5600.87',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Output Power',
        value: '1.7 MW',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Rotor Speed',
        value: '22 RPM',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Peak Torque',
        value: '24900 Nm',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Noise Level',
        value: '82 dB',
        category: 'Manufacturing',
        dataType: 'text'
      },

      {
        name: 'Ship From Organization',
        value: '002 (Atlanta)',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Shipment Date',
        value: '9/6/16',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Shipment#',
        value: '2887212',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Carrier(s)',
        value: 'HGS Transportation Company',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Delivery Date',
        value: '9/6/16',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Delivery Location',
        value: '30524 : 233 South Wacker Dr.--CHICAGO-IL-60606',
        category: 'Logistics',
        dataType: 'text'
      },


      {
        name: 'Installation Date',
        value: '9/9/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Contract #',
        value: 'Crest-GE-992016',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Warranty #',
        value: 'Crest-GE-992016',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Incident #',
        value: 'Crest-000001',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Problem Description',
        value: 'Bearings failure in the Yaw drive',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Date',
        value: '9/12/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Technician',
        value: 'Mathew, John',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Notes',
        value: 'Replaced Bearings in the yaw drive',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part#',
        value: 'WT100004',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part Serial#',
        value: 'SNB000013',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part#',
        value: 'WT100004',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Priority',
        value: 'High',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Work Order #',
        value: 'Crest-000001_WO12345',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Incident Reported Date',
        value: '9/12/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'New Part Serial#',
        value: 'SNB002017',
        category: 'Service',
        dataType: 'text'
      }
    ]
  },

  {
    id: 2,
    dbId: 12133,
    isolateIds:[10657],
    tags:['#206172', '#617292', '#706615'],
    occlusion: true,
    name: '# 326441',
    strokeColor: "#FF8C00",
    fillColor: "#FF8C00",
    worldPoint: {
      x: 1767.7375957165054,
      y: -293.7533821799534,
      z: -757.0288349708471
    },
    tooltip: {
      class: 'predix',
      caption: 'Click to display data ...'
    },
    viewerState:{
      "viewport":{
        "eye":[2621.65713979661,820.9403460534021,-91.53179777560283],
        "target":[2142.3085348611016,142.50689486278867,-697.4703062127841],
        "up":[-0.34006375815333406,-0.4813003035647874,0.8079026291447962],
        "worldUpVector":[0,0,1],
        "pivotPoint":[1744.2526245117188,-379.1203956604004,-889.0680847167969],
        "distanceToOrbit":1670.8725423092899,
        "aspectRatio":1.3713548772169168,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":44.99999100695533
      }
    },
    properties: [
      {
        name: 'Incident #',
        value: '326441',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Part/Model Number',
        value: 'WT000202',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Geo Location',
        value: '10.334.5432',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Deployment Date',
        value: '3/8/16',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Design Revision',
        value: 'A',
        category: 'Asset',
        dataType: 'text'
      },

      {
        name: 'Customer Name',
        value: 'Crest Unlimited',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order#',
        value: '65038',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order Date',
        value: '9/6/16',
        category: 'Sales',
        dataType: 'text'
      },

      {
        name: 'Plant',
        value: '002 (Atlanta)',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Work Order',
        value: '324905',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Start Date',
        value: '8/3/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'End Date',
        value: '9/5/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Part Number',
        value: 'WT000202*912038',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Serial #',
        value: 'SNT000005',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Cost',
        value: '5600.87',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Output Power',
        value: '1.7 MW',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Rotor Speed',
        value: '22 RPM',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Peak Torque',
        value: '24900 Nm',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Noise Level',
        value: '82 dB',
        category: 'Manufacturing',
        dataType: 'text'
      },

      {
        name: 'Ship From Organization',
        value: '002 (Atlanta)',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Shipment Date',
        value: '9/6/16',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Shipment#',
        value: '2887212',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Carrier(s)',
        value: 'HGS Transportation Company',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Delivery Date',
        value: '9/6/16',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Delivery Location',
        value: '30524 : 233 South Wacker Dr.--CHICAGO-IL-60606',
        category: 'Logistics',
        dataType: 'text'
      },


      {
        name: 'Installation Date',
        value: '9/9/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Contract #',
        value: 'Crest-GE-992016',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Warranty #',
        value: 'Crest-GE-992016',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Incident #',
        value: 'Crest-000001',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Problem Description',
        value: 'Bearings failure in the Yaw drive',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Date',
        value: '9/12/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Technician',
        value: 'Mathew, John',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Notes',
        value: 'Replaced Bearings in the yaw drive',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part#',
        value: 'WT100004',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part Serial#',
        value: 'SNB000013',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part#',
        value: 'WT100004',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Priority',
        value: 'High',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Work Order #',
        value: 'Crest-000001_WO12345',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Incident Reported Date',
        value: '9/12/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'New Part Serial#',
        value: 'SNB002017',
        category: 'Service',
        dataType: 'text'
      }
    ]
  },

  {
    id: 3,
    dbId: 17303,
    isolateIds:[17173],
    tags:['#115278', '#806172', '#901628'],
    occlusion: true,
    name: '# 643221',
    strokeColor: "#FF8C00",
    fillColor: "#FF8C00",
    worldPoint: {
      x: 1234.4203642190432,
      y: -747.4166870117188,
      z: -295.0700913724161
    },
    tooltip: {
      class: 'predix',
      caption: 'Click to display data ...'
    },
    viewerState:{
      "viewport":{
        "eye":[1637.6093478178009,-170.6315395128025,11.213656965645903],
        "target":[1529.2575649580003,-375.51411513572555,-171.58022151172818],
        "up":[-0.2895053652042445,-0.5474262011585882,0.7851822704334543],
        "worldUpVector":[0,0,1],
        "pivotPoint":[1281.7653198242188,-714.3992614746094,-501.7978515625],
        "distanceToOrbit":825.7373169582454,
        "aspectRatio":1.3713548772169168,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":44.99999100695533
      }
    },
    properties: [
      {
        name: 'Incident #',
        value: '643221',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Part/Model Number',
        value: 'WT000203',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Geo Location',
        value: '12.334.5567',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Deployment Date',
        value: '9/9/16',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Design Revision',
        value: 'A',
        category: 'Asset',
        dataType: 'text'
      },

      {
        name: 'Customer Name',
        value: 'Crest Unlimited',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order#',
        value: '65038',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order Date',
        value: '9/6/16',
        category: 'Sales',
        dataType: 'text'
      },

      {
        name: 'Plant',
        value: '002 (Atlanta)',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Work Order',
        value: '324905',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Start Date',
        value: '8/3/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'End Date',
        value: '9/5/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Part Number',
        value: 'WT000202*912038',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Serial #',
        value: 'SNT000005',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Cost',
        value: '5600.87',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Output Power',
        value: '1.7 MW',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Rotor Speed',
        value: '22 RPM',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Peak Torque',
        value: '24900 Nm',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Noise Level',
        value: '82 dB',
        category: 'Manufacturing',
        dataType: 'text'
      },

      {
        name: 'Ship From Organization',
        value: '002 (Atlanta)',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Shipment Date',
        value: '9/6/16',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Shipment#',
        value: '2887212',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Carrier(s)',
        value: 'HGS Transportation Company',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Delivery Date',
        value: '9/6/16',
        category: 'Logistics',
        dataType: 'text'
      },
      {
        name: 'Delivery Location',
        value: '30524 : 233 South Wacker Dr.--CHICAGO-IL-60606',
        category: 'Logistics',
        dataType: 'text'
      },


      {
        name: 'Installation Date',
        value: '9/9/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Contract #',
        value: 'Crest-GE-992016',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Warranty #',
        value: 'Crest-GE-992016',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Incident #',
        value: 'Crest-000001',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Problem Description',
        value: 'Bearings failure in the Yaw drive',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Date',
        value: '9/12/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Technician',
        value: 'Mathew, John',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Notes',
        value: 'Replaced Bearings in the yaw drive',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part#',
        value: 'WT100004',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part Serial#',
        value: 'SNB000013',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Part#',
        value: 'WT100004',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Priority',
        value: 'High',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Work Order #',
        value: 'Crest-000001_WO12345',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'Incident Reported Date',
        value: '9/12/16',
        category: 'Service',
        dataType: 'text'
      },
      {
        name: 'New Part Serial#',
        value: 'SNB002017',
        category: 'Service',
        dataType: 'text'
      }
    ]
  },

  {
    id: 4,
    dbId: 10628,
    isolateIds:[10613],
    tags:['#442271', '#881152', '#709855'],
    occlusion: true,
    name: '# 335464',
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: 1855.9721239819078,
      y: 626.7105799997139,
      z: -1136.170585971076
    },
    tooltip: {
      class: 'predix',
      caption: 'Click to display data ...'
    },
    viewerState:{
      "viewport":{
        "eye":[2575.7903970138395,1337.2710208951203,-632.3702479416353],
        "target":[2327.641669106952,1080.3853106918732,-823.9661981301324],
        "up":[-0.3284270604942068,-0.33999053469529505,0.881216263043722],
        "worldUpVector":[0,0,1],
        "pivotPoint":[1699.9625244140625,533.3607635498047,-1135.5078125],
        "distanceToOrbit":1283.5764475394355,
        "aspectRatio":1.3713548772169168,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":44.99999100695533
      }
    },
    properties: [
      {
        name: 'Incident #',
        value: '335464',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Part/Model Number',
        value: 'WT000204',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Geo Location',
        value: '10.334.5567',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Deployment Date',
        value: '9/9/16',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Design Revision',
        value: 'A',
        category: 'Asset',
        dataType: 'text'
      },

      {
        name: 'Customer Name',
        value: 'Crest Unlimited',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order#',
        value: '65038',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order Date',
        value: '9/6/16',
        category: 'Sales',
        dataType: 'text'
      },

      {
        name: 'Plant',
        value: '002 (Atlanta)',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Work Order',
        value: '324905',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Start Date',
        value: '8/3/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'End Date',
        value: '9/5/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Part Number',
        value: 'WT000202*912038',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Serial #',
        value: 'SNT000005',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Cost',
        value: '5600.87',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Output Power',
        value: '1.7 MW',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Rotor Speed',
        value: '22 RPM',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Peak Torque',
        value: '24900 Nm',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Noise Level',
        value: '82 dB',
        category: 'Manufacturing',
        dataType: 'text'
      }
    ]
  },

  {
    id: 5,
    dbId: 14929,
    isolateIds:[14140],
    tags:['#772542', '#773516', '#771903'],
    occlusion: true,
    name: '# 664421',
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: 261.40591250672605,
      y: 176.8220977783203,
      z: -981.9296621799231
    },
    tooltip: {
      class: 'predix',
      caption: 'Click to display data ...'
    },
    viewerState:{
      "viewport":{
        "eye":[1372.5989208692622,1224.942283020284,-423.3287008865235],
        "target":[1214.3787963293628,962.238847341923,-532.4969132066947],
        "up":[-0.1730239165655121,-0.2872831598917354,0.9420886955796414],
        "worldUpVector":[0,0,1],
        "pivotPoint":[425.7345275878906,33.07016372680664,-738.201904296875],
        "distanceToOrbit":1527.6892154091806,
        "aspectRatio":1.3713548772169168,
        "projection":"perspective",
        "isOrthographic":false,
        "fieldOfView":44.99999100695533
      }
    },
    properties: [
      {
        name: 'Part/Model Number',
        value: 'WT000205',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Incident #',
        value: '664421',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Geo Location',
        value: '11.224.3655',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Deployment Date',
        value: '9/9/16',
        category: 'Asset',
        dataType: 'text'
      },
      {
        name: 'Design Revision',
        value: 'A',
        category: 'Asset',
        dataType: 'text'
      },

      {
        name: 'Customer Name',
        value: 'Crest Unlimited',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order#',
        value: '65038',
        category: 'Sales',
        dataType: 'text'
      },
      {
        name: 'Order Date',
        value: '9/6/16',
        category: 'Sales',
        dataType: 'text'
      },

      {
        name: 'Plant',
        value: '002 (Atlanta)',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Work Order',
        value: '324905',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Start Date',
        value: '8/3/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'End Date',
        value: '9/5/16',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Part Number',
        value: 'WT000202*912038',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Serial #',
        value: 'SNT000005',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Cost',
        value: '5600.87',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Output Power',
        value: '1.7 MW',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Rotor Speed',
        value: '22 RPM',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Peak Torque',
        value: '24900 Nm',
        category: 'Manufacturing',
        dataType: 'text'
      },
      {
        name: 'Quality - Noise Level',
        value: '82 dB',
        category: 'Manufacturing',
        dataType: 'text'
      }
    ]
  }
]

class PredixConfiguratorExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onGeometryLoaded = this.onGeometryLoaded.bind(this)

    this.onSelection = this.onSelection.bind(this)

    this.react = this._options.react

    this.hotSpotCommand = new HotSpotCommand (viewer, {
      parentControl: options.parentControl,
      hotspots
    })

    this.panel = new HotSpotPropertyPanel(
      this.viewer.container,
      this.guid(),
      'GE Predix - Hotspot Data')

    var controlledHotspot = null

    this.hotSpotCommand.on('hotspot.created', (hotspot) => {

      if (hotspot.data.controlled) {

        controlledHotspot = hotspot

        hotspot.hide()
      }
    })

    this.hotSpotCommand.on('hotspot.clicked', (hotspot) => {

      const state =  this.react.getState()

      //console.log(JSON.stringify(this.viewer.getState({viewport:true})))

      this.panel.setProperties(hotspot.data.properties)

      this.hotSpotCommand.isolate(hotspot.id)

      this.panel.setVisible(true)

      this.viewer.restoreState(
        hotspot.data.viewerState)

      Toolkit.isolateFull(
        this.viewer,
        hotspot.data.isolateIds)

      const id = hotspot.data.id

      const stateHotSpots = state.hotspots.map((hotspot) => {

        return Object.assign({}, hotspot, {
          active: hotspot.id === id
        })
      })

      this.react.setState({
        activeItem: hotspot.data,
        hotspots: stateHotSpots
      })
    })

    this.socketSvc = ServiceManager.getService('SocketSvc')

    this.socketSvc.on('sensor.temperature', (data) => {

      if (!controlledHotspot) {

        return
      }

      const state =  this.react.getState()

      if (data.objectTemperature > data.threshold) {

        this.react.setState({
          graphData: data
        })

        clearTimeout(this.timeout)

        if (!controlledHotspot.visible) {

          controlledHotspot.show()

          this.react.setState({
            hotspots: [
              ...state.hotspots,
              controlledHotspot.data
            ]
          })
        }

      } else {

        if (controlledHotspot.visible) {

          this.timeout = setTimeout(() => {

            controlledHotspot.hide()

            this.react.setState({
              graphData: null,
              hotspots: state.hotspots.filter((hotspot) => {
                return !hotspot.controlled
              })
            })

            const activeItem = state.activeItem

            if (activeItem && (activeItem.id === controlledHotspot.id)) {

              this.react.setState({
                activeItem: null
              })
            }
          }, 20 * 1000)
        }
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.UISettings', {
        toolbar:{
          removedControls: [
            '#navTools'
          ],
          retargetedControls: [

          ]
        }
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu, selectedDbId) => {
          return !selectedDbId
            ? [{
                title: 'Show all objects',
                target: () => {
                  Toolkit.isolateFull(this.viewer)
                  this.hotSpotCommand.isolate()
                  this.viewer.fitToView()
              }}]
            : menu
        }
    })

    this.eventTool = new EventTool(this.viewer)

    this.eventTool.activate()

    this.eventTool.on('singleclick', (event) => {

      this.pointer = event
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        this._options.loader.hide()
        this.hotSpotCommand.activate()
      })

    this.viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    this.viewer.setProgressiveRendering(true)
    this.viewer.setQualityLevel(false, true)
    this.viewer.setGroundReflection(false)
    this.viewer.setGroundShadow(false)
    this.viewer.setLightPreset(1)

    this.react.pushRenderExtension(this)

    this.react.setState({
      hotspots: hotspots.filter((hotspot) => {
        return !hotspot.controlled
      })
    })

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Configurator.Predix'
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.viewer.removeEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    this.hotSpotCommand.deactivate()

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onGeometryLoaded (event) {

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelection (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const dbIds = selection.dbIdArray

      const data = this.viewer.clientToWorld(
        this.pointer.canvasX,
        this.pointer.canvasY,
        true)

      console.log(data)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onItemClicked (item) {

    const state = this.react.getState()

    const activeItem = state.activeItem

    const hs = state.hotspots

    if (activeItem && (activeItem.id === item.id)) {

      this.react.setState({
        activeItem: null
      })

      Toolkit.isolateFull(this.viewer)

      this.hotSpotCommand.isolate()

      this.panel.setVisible(false)

      this.viewer.fitToView()

    } else {

      this.panel.setProperties(item.properties)

      this.hotSpotCommand.isolate(item.id)

      this.panel.setVisible(true)

      this.viewer.restoreState(
        item.viewerState)

      Toolkit.isolateFull(
        this.viewer,
        item.isolateIds)

      const stateHotSpots = hs.map((hotspot) => {

        return Object.assign({}, hotspot, {
          active: hotspot.id === item.id
        })
      })

      this.react.setState({
        hotspots: stateHotSpots,
        activeItem: item
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  hexToRgbA (hex, alpha) {

    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {

      var c = hex.substring(1).split('')

      if (c.length == 3) {

        c = [c[0], c[0], c[1], c[1], c[2], c[2]]
      }

      c = '0x' + c.join('')

      return `rgba(${(c>>16)&255},${(c>>8)&255},${c&255},${alpha})`
    }

    throw new Error('Bad Hex Number: ' + hex)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    const state = this.react.getState()

    var renderGraph = false

    const items = state.hotspots.map((hotspot) => {

      const active = hotspot.active ? ' active' : ''

      if (active.length) {

        renderGraph = true
      }

      const style = {
        backgroundColor: this.hexToRgbA(hotspot.fillColor, 0.3),
        border: `2px solid ${hotspot.strokeColor}`
      }

      return (
        <div key={`item-${hotspot.id}`}
          className={'list-item ' + active}
          onClick={() => {
            this.onItemClicked(hotspot)
          }}>
          <div className="item-priority" style={style}>
          </div>
          <label>
            {hotspot.name || hotspot.id}
          </label>
        </div>
      )
    })

    const threshold = state.graphData
      ? state.graphData.threshold
      : 20 + (0.5 - Math.random()) * 10

    const value = state.graphData
      ? state.graphData.objectTemperature
      : null

    return (
      <WidgetContainer title="Incidents">
        <ReflexContainer key="incidents" orientation='horizontal'>
          <ReflexElement flex={0.35}>
            <div className="item-list-container">
              {items}
            </div>
          </ReflexElement>
          <ReflexSplitter/>
          <ReflexElement className="graph-list-container"
            renderOnResize={true}
            propagateDimensions={true}>

              <IoTGraph
                activeItem={state.activeItem}
                threshold={threshold}
                value={value}
                tagIdx={0} />

              <IoTGraph activeItem={state.activeItem} tagIdx={1}/>
              <IoTGraph activeItem={state.activeItem} tagIdx={2}/>

          </ReflexElement>
        </ReflexContainer>
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PredixConfiguratorExtension.ExtensionId,
  PredixConfiguratorExtension)

module.exports = 'Viewing.Extension.Configurator.Predix'
