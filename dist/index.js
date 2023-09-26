#!/usr/bin/env node
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
const Choicer_1 = require("./src/Choicer");
const CliManager_1 = require("./src/CliManager");
const types_1 = require("./types");
const os_1 = __importDefault(require("os"));
const ContainersManager_1 = require("./src/ContainersManager");
const ImagesManager_1 = require("./src/ImagesManager");
const AppManager_1 = require("./src/AppManager");
const prompts_1 = require("@inquirer/prompts");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
class DockerManager extends CliManager_1.CliManager {
    constructor(containersManager, imagesManager, appManager) {
        super();
        this.containersManager = containersManager;
        this.imagesManager = imagesManager;
        this.appManager = appManager;
    }
    setEnvVariables() {
        return __awaiter(this, void 0, void 0, function* () {
            const env = Object.create(process.env);
            env.PATH = `${env.PATH}:/usr/bin:/usr/sbin`;
        });
    }
    installDocker() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Checking OS...');
            if (os_1.default.platform() === 'linux') {
                console.log('The current system is Linux.');
            }
            else {
                console.log('The current system is not Linux.');
                console.log('Installation is not possible');
                return;
            }
            console.log('Updating system packages...');
            yield this.executeCommandWithOutput('sudo', ['apt-get', 'update', '-y']);
            console.log('Upgrading system packages...');
            yield this.executeCommandWithOutput('sudo', ['apt-get', 'upgrade', '-y']);
            console.log('Installing Docker...');
            yield this.executeCommandWithOutput('sudo', ['apt-get', 'install', '-y', 'ca-certificates', 'curl', 'gnupg']);
            yield this.executeCommandWithOutput('sudo', ['install', '-m', '0755', '-d', '/etc/apt/keyrings']);
            yield this.executeCommandWithOutput('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg', [], true);
            yield this.executeCommandWithOutput('sudo', ['chmod', 'a+r', '/etc/apt/keyrings/docker.gpg']);
            const architecture = yield this.executeCommandCopyOutput('dpkg', ['--print-architecture']);
            const versionCodeName = yield this.executeCommandCopyOutput('bash', ['-c', '. /etc/os-release && echo "$VERSION_CODENAME"']);
            const repositoryCommand = `echo "deb [arch=${architecture} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${versionCodeName} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`;
            yield this.executeCommandWithOutput('bash', ['-c', repositoryCommand]);
            yield this.executeCommandWithOutput('sudo', ['apt-get', 'update', '-y']);
            yield this.executeCommandWithOutput('sudo', ['apt-get', 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io', 'docker-buildx-plugin', 'docker-compose-plugin']);
            console.log('Installing Docker Compose...');
            yield this.executeCommandWithOutput('sudo', ['apt-get', 'install', '-y', 'docker-compose']);
            console.log('Configuring Docker group...');
            yield this.executeCommandWithOutput('sudo', ['usermod', '-aG', 'docker', process.env.USER]); //todo :check
            console.log('Docker installation and configuration complete!');
            return;
        });
    }
    manageContainers() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ManageContainersActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ManageContainersActions.Start: {
                    yield this.containersManager.start();
                    break;
                }
                case types_1.ManageContainersActions.List: {
                    yield this.containersManager.list();
                    break;
                }
                case types_1.ManageContainersActions.Remove: {
                    yield this.containersManager.remove();
                    break;
                }
                case types_1.ManageContainersActions.Stop: {
                    yield this.containersManager.stop();
                    break;
                }
            }
        });
    }
    manageImages() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ManageImagesActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ManageImagesActions.List: {
                    yield this.imagesManager.list();
                    break;
                }
                case types_1.ManageImagesActions.Remove: {
                    yield this.imagesManager.remove();
                    break;
                }
            }
        });
    }
    manage() {
        return __awaiter(this, void 0, void 0, function* () {
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.ManageActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.ManageActions.Containers: {
                    yield this.manageContainers();
                    break;
                }
                case types_1.ManageActions.Images: {
                    yield this.manageImages();
                    break;
                }
            }
        });
    }
    runApp() {
        return __awaiter(this, void 0, void 0, function* () {
            const list = this.appManager.appNames;
            const choicer = new Choicer_1.Choicer('What to do?', list);
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            this.appManager.runApp(data);
        });
    }
    prune() {
        return __awaiter(this, void 0, void 0, function* () {
            const isConfirmed = yield this.confirmPrompt('Are you sure? It will remove all unused resources!');
            if (isConfirmed) {
                yield this.executeCommandWithOutput('docker', ['system', 'prune', '-f']);
            }
        });
    }
    selectFromList(message, choices) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, prompts_1.select)({ message, choices: choices.map((choice) => ({ value: choice, message: choice })) });
            return data;
        });
    }
    attach() {
        return __awaiter(this, void 0, void 0, function* () {
            const containerNames = yield this.containersManager.getContainerNames();
            if (!containerNames.length) {
                console.error('No running containers found.');
                return;
            }
            const containerToAttach = yield this.selectFromList('Select container to attach:', containerNames);
            yield this.executeCommandWithOutput('docker', ['attach', containerToAttach]);
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setEnvVariables();
            const choicer = new Choicer_1.Choicer('What to do?', Object.keys(types_1.MainActions));
            const data = yield (0, prompts_1.select)(choicer.inqSelectConfig);
            switch (data) {
                case types_1.MainActions.RunApp: {
                    yield this.runApp();
                    break;
                }
                case types_1.MainActions.Install: {
                    yield this.installDocker();
                    break;
                }
                case types_1.MainActions.Manage: {
                    yield this.manage();
                    break;
                }
                case types_1.MainActions.Attach: {
                    yield this.attach();
                    break;
                }
                case types_1.MainActions.Prune: {
                    yield this.prune();
                    break;
                }
                case types_1.MainActions.Exit: {
                    process.exit();
                }
            }
        });
    }
}
const dockerManager = new DockerManager(new ContainersManager_1.ContainersManager(), new ImagesManager_1.ImagesManager(), new AppManager_1.AppManager());
dockerManager.run();
