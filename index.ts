#!/usr/bin/env node
import { Choicer } from "./src/Choicer";
import { CliManager } from "./src/CliManager";
import { MainActions, ManageActions, ManageContainersActions, ManageImagesActions } from "./types";
import os from 'os';
import { ContainersManager } from "./src/ContainersManager";
import { ImagesManager } from "./src/ImagesManager";
import { AppManager } from "./src/AppManager";
import { select } from '@inquirer/prompts';
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

class DockerManager extends CliManager {
    private readonly containersManager: ContainersManager
    private readonly imagesManager: ImagesManager
    private readonly appManager: AppManager

    constructor(containersManager: ContainersManager, imagesManager: ImagesManager, appManager: AppManager) {
        super();
        this.containersManager = containersManager;
        this.imagesManager = imagesManager;
        this.appManager = appManager;
    }

    private async setEnvVariables() {
        const env = Object.create(process.env);
        env.PATH = `${env.PATH}:/usr/bin:/usr/sbin`;
    }

    private async installDocker(): Promise<void> {
        console.log('Checking OS...');
        if (os.platform() === 'linux') {
            console.log('The current system is Linux.');
        } else {
            console.log('The current system is not Linux.');
            console.log('Installation is not possible')
            return
        }

        console.log('Updating system packages...')
        await this.executeCommandWithOutput('sudo', ['apt-get', 'update', '-y']);

        console.log('Upgrading system packages...')
        await this.executeCommandWithOutput('sudo', ['apt-get', 'upgrade', '-y']);

        console.log('Installing Docker...');
        await this.executeCommandWithOutput('sudo', ['apt-get', 'install', '-y', 'ca-certificates', 'curl', 'gnupg']);
        await this.executeCommandWithOutput('sudo', ['install', '-m', '0755', '-d', '/etc/apt/keyrings']);
        await this.executeCommandWithOutput('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg', [], true);
        await this.executeCommandWithOutput('sudo', ['chmod', 'a+r', '/etc/apt/keyrings/docker.gpg']);

        const architecture = await this.executeCommandCopyOutput('dpkg', ['--print-architecture']);
        const versionCodeName = await this.executeCommandCopyOutput('bash', ['-c', '. /etc/os-release && echo "$VERSION_CODENAME"']);
        const repositoryCommand = `echo "deb [arch=${architecture} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${versionCodeName} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`;
        await this.executeCommandWithOutput('bash', ['-c', repositoryCommand]);

        await this.executeCommandWithOutput('sudo', ['apt-get', 'update', '-y']);
        await this.executeCommandWithOutput('sudo', ['apt-get', 'install', '-y', 'docker-ce', 'docker-ce-cli', 'containerd.io', 'docker-buildx-plugin', 'docker-compose-plugin']);

        console.log('Installing Docker Compose...');
        await this.executeCommandWithOutput('sudo', ['apt-get', 'install', '-y', 'docker-compose']);

        console.log('Configuring Docker group...');
        await this.executeCommandWithOutput('sudo', ['usermod', '-aG', 'docker', process.env.USER!]); //todo :check
        console.log('Docker installation and configuration complete!');
        return;
    }

    private async manageContainers(): Promise<void> {
        const choicer = new Choicer<ManageContainersActions>('What to do?', Object.keys(ManageContainersActions) as ManageContainersActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ManageContainersActions.Start: {
                await this.containersManager.start()
                break;
            }
            case ManageContainersActions.List: {
                await this.containersManager.list()
                break;
            }
            case ManageContainersActions.Remove: {
                await this.containersManager.remove()
                break;
            }
            case ManageContainersActions.Stop: {
                await this.containersManager.stop()
                break;
            }
        }
    }

    private async manageImages(): Promise<void> {
        const choicer = new Choicer<ManageImagesActions>('What to do?', Object.keys(ManageImagesActions) as ManageImagesActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ManageImagesActions.List: {
                await this.imagesManager.list()
                break;
            }
            case ManageImagesActions.Remove: {
                await this.imagesManager.remove()
                break;
            }
        }
    }

    private async manage(): Promise<void> {
        const choicer = new Choicer<ManageActions>('What to do?', Object.keys(ManageActions) as ManageActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ManageActions.Containers: {
                await this.manageContainers()
                break;
            }

            case ManageActions.Images: {
                await this.manageImages()
                break;
            }
        }
    }

    private async runApp(): Promise<void> {
        const list = this.appManager.appNames;
        const choicer = new Choicer<string>('What to do?', list);
        const data = await select(choicer.inqSelectConfig);

        this.appManager.runApp(data)
    }

    private async prune(): Promise<void> {
        const isConfirmed = await this.confirmPrompt('Are you sure? It will remove all unused resources!');

        if (isConfirmed) {
            await this.executeCommandWithOutput('docker', ['system', 'prune', '-f']);
        }
    }



    async selectFromList(message: string, choices: string[]) {
        const data = await select({ message, choices: choices.map((choice) => ({ value: choice, message: choice})) })
        return data;
    }

    private async attach(): Promise<void> {
        const containerNames = await this.containersManager.getContainerNames();
        if (!containerNames.length) {
            console.error('No running containers found.');
            return;
        }
        const containerToAttach = await this.selectFromList('Select container to attach:', containerNames);
        await this.executeCommandWithOutput('docker', ['attach', containerToAttach]);
    }

    public async run(): Promise<void> {
        this.setEnvVariables();
        const choicer = new Choicer<MainActions>('What to do?', Object.keys(MainActions) as MainActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case MainActions.RunApp: {
                await this.runApp();
                break;
            }

            case MainActions.Install: {
                await this.installDocker();
                break;
            }

            case MainActions.Manage: {
                await this.manage();
                break;
            }

            case MainActions.Attach: {
                await this.attach();
                break;
            }

            case MainActions.Prune: {
                await this.prune();
                break;
            }

            case MainActions.Exit: {
                process.exit();
            }
            
        }
    }
}

const dockerManager = new DockerManager(new ContainersManager(), new ImagesManager(), new AppManager());
dockerManager.run();