export enum MainActions {
    Install = 'Install',
    RunApp = 'RunApp',
    Manage = 'Manage',
    Attach = 'Attach',
    Prune = 'Prune',
    Exit = 'Exit'
}

export enum ManageActions {
    Containers = 'Containers',
    Images = 'Images'
}

export enum ManageContainersActions {
    Remove = 'Remove',
    Stop = 'Stop',
    Start = 'Start',
    List = 'List'
}

export enum ManageImagesActions {
    Remove = 'Remove',
    List = 'List'
}

export enum ContainersRemoveActions {
    Stopped = 'Stopped',
    Specific = 'Specific',
    Running = 'Running'
}

export enum ContainersStopActions {
    Specific = 'Specific',
    Running = 'Running'
}

export enum ContainersStartActions {
    Specific = 'Specific',
    Stopped = 'Stopped'
}

export enum ImagesRemoveActions {
    All = 'All',
    Dangling = 'Dangling',
    Specific = 'Specific'
}