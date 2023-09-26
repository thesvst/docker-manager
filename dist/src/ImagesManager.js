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
exports.ImagesManager = void 0;
const prompts_1 = require("@inquirer/prompts");
const Choicer_1 = require("./Choicer");
const CliManager_1 = require("./CliManager");
const types_1 = require("../types");
class ImagesManager extends CliManager_1.CliManager {
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeCommandWithOutput('docker', ['image', 'ls', '-a']);
            return;
        });
    }
    remove() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ImagesRemoveActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ImagesRemoveActions.All: {
                    const list = (yield this.executeCommand(`docker images --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`));
                    if (list.length === 0) {
                        console.log('There are no images!');
                        return;
                    }
                    list.split(',').forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker rmi -f ${name}`);
                    }));
                    console.log('All images have been deleted');
                    break;
                }
                case types_1.ImagesRemoveActions.Dangling: {
                    const list = (yield this.executeCommand(`docker images -f "dangling=true" --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`));
                    if (list.length === 0) {
                        console.log('There are no dangling images!');
                        return;
                    }
                    list.split(',').forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker rmi ${name}`);
                    }));
                    console.log('All dangling images have been deleted');
                    break;
                }
                case types_1.ImagesRemoveActions.Specific: {
                    const list = (yield this.executeCommand(`docker images --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`));
                    if (list.length === 0) {
                        console.log('There are no images!');
                        return;
                    }
                    const data = yield (0, prompts_1.checkbox)({
                        message: 'Select containers to remove', choices: list.split(',').map((choice) => ({ value: choice, message: choice }))
                    });
                    data.forEach((name) => __awaiter(this, void 0, void 0, function* () {
                        yield this.executeCommand(`docker rmi -f ${name}`);
                    }));
                    console.log('Removed images:', data.join(','));
                    break;
                }
            }
        });
    }
}
exports.ImagesManager = ImagesManager;
