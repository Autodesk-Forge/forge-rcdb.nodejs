const Systems = [
  {
    name: 'Data Management',
    id: 'data',
    events: [
      // {
      //   desc: 'All Data Management events.',
      //   name: 'Full System Events',
      //   id: null
      // },
      {
        desc: 'When a new version of an item (file) is added to a project or folder.',
        name: 'File Version Added',
        id: 'dm.version.added'
      },
      {
        desc: 'When a version of an item is modified.',
        name: 'File Version Modified',
        id: 'dm.version.modified'
      },
      {
        desc: 'When a version of an item is deleted from a project or folder.',
        name: 'File Version Deleted',
        id: 'dm.version.deleted'
      },
      {
        desc: 'When a version of an item is moved from a project or folder to another project or folder.',
        name: 'File Version Moved',
        id: 'dm.version.moved'
      },
      {
        desc: 'When a version of an item is copied to a folder or project.',
        name: 'File Version Copied',
        id: 'dm.version.copied	'
      },
      {
        desc: 'When a new folder is added to a project or folder.',
        name: 'Folder Added',
        id: 'dm.folder.added	'
      },
      {
        desc: 'When a folder is modified.',
        name: 'Folder Modified',
        id: 'dm.folder.modified'
      },
      {
        desc: 'When a folder is deleted.',
        name: 'Folder Deleted',
        id: 'dm.folder.deleted'
      },
      {
        desc: 'When a folder is moved to another project or folder.',
        name: 'Folder Moved',
        id: 'dm.folder.moved'
      },
      {
        desc: 'When a folder is copied to another project or folder.',
        name: 'Folder Copied',
        id: 'dm.folder.copied'
      },
    ]
  }
]


export default Systems









