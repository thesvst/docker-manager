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
    Stop = 'Stop',
    Start = 'Start',
    List = 'List'
}