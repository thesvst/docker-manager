"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainersManager = void 0;
const Choicer_1 = require("./Choicer");
const CliManager_1 = require("./CliManager");
const prompts_1 = require("@inquirer/prompts");
const types_1 = require("../types");
class ContainersManager extends CliManager_1.CliManager {
    getContainerNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const names = yield this.executeCommand(`docker ps --format '{{.Names}}' | paste -sd ","`);
            if (names.length === 0)
                return [];
            return names.split(',');
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ContainersStartActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ContainersStartActions.Specific: {
                    const list = (yield this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`));
                    if (list.length === 0) {
                        console.log('There are no stopped containers!');
                        return;
                    }
                    const data = yield (0, prompts_1.checkbox)({
                        message: 'Select containers to start', choices: list.split(',').map((choice) => ({ value: choice, message: choice }))
                    });
                    data.forEach((name) => __awaiter(this, void 0, void 0, function* () { yield this.executeCommand(`docker start ${name}`); }));
                    break;
                }
                case types_1.ContainersStartActions.Stopped: {
                    const list = (yield this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`));
                    if (list.length === 0) {
                        console.log('There are no stopped containers!');
                        return;
                    }
                    list.split(',').forEach((name) => __awaiter(this, void 0, void 0, function* () { yield this.executeCommand(`docker start ${name}`); }));
                    console.log('Started containers:', list);
                    break;
                }
            }
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeCommandWithOutput('docker', ['container', 'ls', '-a']);
            return;
        });
    }
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ContainersRemoveActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ContainersRemoveActions.Running: {
                    const list = yield this.getContainerNames();
                    if (list.length === 0) {
                        console.log('There are no running containers!');
                        return;
                    }
                    list.forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker stop ${name}`);
                        yield this.executeCommand(`docker rm ${name}`);
                    }));
                    console.log('Removed containers:', list.join(','));
                    break;
                }
                case types_1.ContainersRemoveActions.Stopped: {
                    const list = (yield this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`));
                    if (list.length === 0) {
                        console.log('There are no stopped containers!');
                        return;
                    }
                    list.split(',').forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker stop ${name}`);
                        yield this.executeCommand(`docker rm ${name}`);
                    }));
                    console.log('Removed containers:', list);
                    break;
                }
                case types_1.ContainersRemoveActions.Specific: {
                    const list = yield this.getContainerNames();
                    if (list.length === 0) {
                        console.log('There are no containers!');
                        return;
                    }
                    const data = yield (0, prompts_1.checkbox)({
                        message: 'Select containers to remove', choices: list.map((choice) => ({ value: choice, message: choice }))
                    });
                    data.forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker stop ${name}`);
                        yield this.executeCommand(`docker rm ${name}`);
                    }));
                    console.log('Removed containers:', data.join(','));
                    break;
                }
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ContainersStopActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ContainersStopActions.Running: {
                    const list = yield this.getContainerNames();
                    if (list.length === 0) {
                        console.log('There are no running containers!');
                        return;
                    }
                    list.forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker stop ${name}`);
                    }));
                    console.log('Stopped containers:', list.join(','));
                    break;
                }
                case types_1.ContainersStopActions.Specific: {
                    const list = yield this.getContainerNames();
                    if (list.length === 0) {
                        console.log('There are no containers!');
                        return;
                    }
                    const data = yield (0, prompts_1.checkbox)({
                        message: 'Select containers to remove', choices: list.map((choice) => ({ value: choice, message: choice }))
                    });
                    data.forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker stop ${name}`);
                    }));
                    console.log('Stopped containers:', list.join(','));
                    break;
                }
            }
        });
    }
}
exports.ContainersManager = ContainersManager;
