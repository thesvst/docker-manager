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
exports.AppManager = void 0;
const CliManager_1 = require("./CliManager");
class AppManager extends CliManager_1.CliManager {
    constructor() {
        super();
        this.apps = process.env.APP_NAMES;
    }
    get appNames() {
        return this.apps.split(',');
    }
    runApp(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const envCommand = process.env[`${name.toUpperCase()}_START_COMMAND`];
            if (envCommand === null || envCommand === void 0 ? void 0 : envCommand.includes('npm')) {
                const commandToRun = `newgrp docker <<EOL\n${envCommand}\nEOL`;
                const [command, ...args] = commandToRun.split(' ');
                yield this.executeCommandWithOutput(command, args, true);
            }
            else if (envCommand) {
                yield this.executeCommandWithOutput(envCommand, [], true);
            }
        });
    }
}
exports.AppManager = AppManager;
