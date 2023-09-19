import { Choicer } from "./Choicer";
import { CliManager } from "./CliManager";
import { MainActions, ManageActions, ManageContainersActions, ManageImagesActions } from "./types";
import os from 'os';
import { ContainersManager } from "./ContainersManager";
import { ImagesManager } from "./ImagesManager";
import { AppManager } from "./AppManager";
import { select } from '@inquirer/prompts';

class DockerManager extends CliManager {
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
        const choicer = new Choicer<ManageContainersActions>('list', 'initial', 'What to do?', Object.keys(ManageContainersActions) as ManageContainersActions[]);
        const data = await select(choicer.inqSelectConfig)
        const containersManager = new ContainersManager();

        switch(data) {
            case ManageContainersActions.Start: {
                await containersManager.start()
            }
            case ManageContainersActions.List: {
                await containersManager.list()
            }
            case ManageContainersActions.Remove: {
                await containersManager.remove()
            }
            case ManageContainersActions.Stop: {
                await containersManager.stop()
            }
        }
    }

    private async manageImages(): Promise<void> {
        const choicer = new Choicer<ManageImagesActions>('list', 'initial', 'What to do?', Object.keys(ManageImagesActions) as ManageImagesActions[]);
        const data = await select(choicer.inqSelectConfig)
        const imagesManager = new ImagesManager();

        switch(data) {
            case ManageImagesActions.Start: {
                await imagesManager.start()
            }
            case ManageImagesActions.List: {
                await imagesManager.start()
            }
            case ManageImagesActions.Remove: {
                await imagesManager.start()
            }
            case ManageImagesActions.Stop: {
                await imagesManager.start()
            }
        }
    }

    private async manage(): Promise<void> {
        const choicer = new Choicer<ManageActions>('list', 'data', 'What to do?', Object.keys(ManageActions) as ManageActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ManageActions.Containers: {
                await this.manageContainers()
            }

            case ManageActions.Images: {
                await this.manageImages()
            }
        }
    }

    private async runApp(): Promise<void> {
        // const appManager = new AppManager();
        
    }

    private async prune(): Promise<void> {
        const isConfirmed = await this.confirmPrompt('Are you sure? It will remove all unused resources!');

        if (isConfirmed) {
            await this.executeCommandWithOutput('docker', ['system', 'prune', '-f']);
        }
    }

    private async getContainerNames(): Promise<string[]> {
        const names = await this.executeCommand(`docker ps --format '{{.Names}}' | paste -sd ","`) as string;
        if (names.length === 0) return []
        return names.split(',');
    }

    async selectFromList(message: string, choices: string[]) {
        const data = await select({ message, choices: choices.map((choice) => ({ value: choice, message: choice})) })
        return data;
    }

    private async attach(): Promise<void> {
        const containerNames = await this.getContainerNames();
        if (!containerNames.length) {
            console.error('No running containers found.');
            return;
        }
        const containerToAttach = await this.selectFromList('Select container to attach:', containerNames);
        await this.executeCommandWithOutput('docker', ['attach', containerToAttach]);
    }

    public async run(): Promise<void> {
        this.setEnvVariables();
        const choicer = new Choicer<MainActions>('list', 'data', 'What to do?', Object.keys(MainActions) as MainActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case MainActions.RunApp: {
                await this.runApp();
            }

            case MainActions.Install: {
                await this.installDocker();
            }

            case MainActions.Manage: {
                await this.manage();
            }

            case MainActions.Attach: {
                await this.attach();
            }

            case MainActions.Prune: {
                await this.prune();
            }

            case MainActions.Exit: {
                process.exit();
            }
            
        }
    }
}

const dockerManager = new DockerManager();
dockerManager.run();