"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesRemoveActions = exports.ContainersStartActions = exports.ContainersStopActions = exports.ContainersRemoveActions = exports.ManageImagesActions = exports.ManageContainersActions = exports.ManageActions = exports.MainActions = void 0;
var MainActions;
(function (MainActions) {
    MainActions["Install"] = "Install";
    MainActions["RunApp"] = "RunApp";
    MainActions["Manage"] = "Manage";
    MainActions["Attach"] = "Attach";
    MainActions["Prune"] = "Prune";
    MainActions["Exit"] = "Exit";
})(MainActions || (exports.MainActions = MainActions = {}));
var ManageActions;
(function (ManageActions) {
    ManageActions["Containers"] = "Containers";
    ManageActions["Images"] = "Images";
})(ManageActions || (exports.ManageActions = ManageActions = {}));
var ManageContainersActions;
(function (ManageContainersActions) {
    ManageContainersActions["Remove"] = "Remove";
    ManageContainersActions["Stop"] = "Stop";
    ManageContainersActions["Start"] = "Start";
    ManageContainersActions["List"] = "List";
})(ManageContainersActions || (exports.ManageContainersActions = ManageContainersActions = {}));
var ManageImagesActions;
(function (ManageImagesActions) {
    ManageImagesActions["Remove"] = "Remove";
    ManageImagesActions["List"] = "List";
})(ManageImagesActions || (exports.ManageImagesActions = ManageImagesActions = {}));
var ContainersRemoveActions;
(function (ContainersRemoveActions) {
    ContainersRemoveActions["Stopped"] = "Stopped";
    ContainersRemoveActions["Specific"] = "Specific";
    ContainersRemoveActions["Running"] = "Running";
})(ContainersRemoveActions || (exports.ContainersRemoveActions = ContainersRemoveActions = {}));
var ContainersStopActions;
(function (ContainersStopActions) {
    ContainersStopActions["Specific"] = "Specific";
    ContainersStopActions["Running"] = "Running";
})(ContainersStopActions || (exports.ContainersStopActions = ContainersStopActions = {}));
var ContainersStartActions;
(function (ContainersStartActions) {
    ContainersStartActions["Specific"] = "Specific";
    ContainersStartActions["Stopped"] = "Stopped";
})(ContainersStartActions || (exports.ContainersStartActions = ContainersStartActions = {}));
var ImagesRemoveActions;
(function (ImagesRemoveActions) {
    ImagesRemoveActions["All"] = "All";
    ImagesRemoveActions["Dangling"] = "Dangling";
    ImagesRemoveActions["Specific"] = "Specific";
})(ImagesRemoveActions || (exports.ImagesRemoveActions = ImagesRemoveActions = {}));
