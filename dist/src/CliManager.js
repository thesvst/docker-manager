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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliManager = void 0;
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
class CliManager {
    executeCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)(command, (error, stdout) => {
                    if (error) {
                        console.error(`Error executing: ${command}`, error);
                        reject(error);
                    }
                    resolve(stdout.trim());
                });
            });
        });
    }
    executeCommandCopyOutput(command, args, shell = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const spawnedProcess = (0, child_process_1.spawn)(command, args, { stdio: [process.stdin, 'pipe', process.stderr], shell });
                let outputData = '';
                spawnedProcess.stdout.on('data', (data) => {
                    outputData += data.toString();
                });
                spawnedProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`Process finished`);
                        resolve(outputData.trim());
                    }
                    else {
                        reject(new Error(`Process exited with code: ${code}`));
                    }
                });
            });
        });
    }
    executeCommandWithOutput(command, args, shell = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const spawnedProcess = (0, child_process_1.spawn)(command, args, { stdio: 'inherit', shell });
                spawnedProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`Process finished`);
                        resolve('Process finished');
                    }
                    else {
                        reject(new Error(`Process exited with code: ${code}`));
                    }
                });
            });
        });
    }
    confirmPrompt(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { confirm } = yield inquirer_1.default.prompt({
                type: 'confirm', name: 'confirm', message, default: false,
            });
            return confirm;
        });
    }
}
exports.CliManager = CliManager;
