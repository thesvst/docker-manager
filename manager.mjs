#!/usr/bin/env node
import inquirer from 'inquirer';
import { exec, spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = `${__dirname}/.env`;
dotenv.config({ path: envPath });

class DockerManager {
    constructor() {
        this.initChoices();
    }

    initChoices() {
        this.choices = {
            mainChoice: {
                type: 'list',
                name: 'mainChoice',
                message: 'What to do?',
                choices: [
                    'Run Docker',
                    'Manage containers',
                    'Manage images',
                    'Attach to a container',
                    'Enter container bash',
                    'Install Docker (only Ubuntu, preferred 22.04)',
                    'Prune',
                    'Exit'
                ],
            },
            manageDockerContainers: {
                type: 'list',
                name: 'containerAction',
                message: 'What to do?',
                choices: [
                    'Remove all containers',
                    'Remove all stopped containers',
                    'Remove specific containers',
                    'List containers',
                    'Back to main menu'
                ],
            },
            runDocker: {
                type: 'list',
                name: 'app',
                message: 'Select app:',
                choices: ['Web', 'API', 'Engine (soon)', 'Client (soon)'],
            }
        };
    }

    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout) => {
                if (error) {
                    console.error(`Error executing: ${command}`, error);
                    reject(error);
                }
                resolve(stdout.trim());
            });
        });
    }

    async executeCommandCopyOutput(command, args, shell = false) {
        return new Promise((resolve, reject) => {
            const spawnedProcess = spawn(command, args, { stdio: [process.stdin, 'pipe', process.stderr], shell });

            let outputData = '';

            spawnedProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            spawnedProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`Process finished`);
                    resolve(outputData.trim());
                } else {
                    reject(new Error(`Process exited with code: ${code}`));
                }
            });
        });
    }


    async executeCommandWithOutput(command, args, shell = false) {
        return new Promise((resolve, reject) => {
            const spawnedProcess = spawn(command, args, { stdio: 'inherit', shell });

            spawnedProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`Process finished`);
                    resolve();
                } else {
                    reject(new Error(`Process exited with code: ${code}`));
                }
            });
        });
    }


    async getContainerNames() {
        const names = await this.executeCommand(`docker ps --format '{{.Names}}' | paste -sd ","`);
        if (names.length === 0) return []
        return names.split(',');
    }

    async confirmPrompt(message) {
        const { confirm } = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message,
            default: false,
        });
        return confirm;
    }

    async selectFromList(promptMessage, items) {
        const { selectedItem } = await inquirer.prompt({
            type: 'list',
            name: 'selectedItem',
            message: promptMessage,
            choices: items,
        });
        return selectedItem;
    }

    async installDocker() {
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
        await this.executeCommandWithOutput('sudo', ['usermod', '-aG', 'docker', process.env.USER]);
        console.log('Docker installation and configuration complete!');
        return;
    }

    async runDocker() {
        const { app } = await inquirer.prompt(this.choices.runDocker);
        const scriptMap = {
            Web: `npm run start:local --prefix ${process.env.WEB_DIR_PATH}`,
            API: `npm run start:local --prefix ${process.env.API_DIR_PATH}`,
            Engine: ``,
            Clinet: ``,
        };

        const dockerCommand = scriptMap[app];
        const commandToRun = `newgrp docker <<EOL\n${dockerCommand}\nEOL`;

        const [command, ...args] = commandToRun.split(' ');
        await this.executeCommandWithOutput(command, args, true);
    }
    async manageDockerContainers() {
        const { containerAction } = await inquirer.prompt(this.choices.manageDockerContainers);
        switch (containerAction) {
            case 'Remove all containers': {
                const containerNames = await this.getContainerNames();
                if (!containerNames.length) {
                    console.error('No running containers found.');
                    return;
                }
                await this.executeCommand('docker stop $(docker ps -q)');
                await this.executeCommand('docker rm $(docker ps -aq)');
                break;
            }
            case 'Remove all stopped containers':
                const names = await this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`);
                if (names.length === 0) {
                    console.log('There are no stopped containers!');
                    return;
                }
                names.split(',').forEach(async (name) => {
                    await this.executeCommand(`docker rm ${name}`);
                })
                break;
            case 'Remove specific containers':
                const containerNames = await this.getContainerNames();
                if (!containerNames.length) {
                    console.error('No running containers found.');
                    return;
                }

                const { containersToRemove } = await inquirer.prompt({
                    type: 'checkbox',
                    name: 'containersToRemove',
                    message: 'Select containers to remove:',
                    choices: containerNames,
                });
                for (const container of containersToRemove) {
                    await this.executeCommand(`docker stop ${container}`);
                    await this.executeCommand(`docker rm ${container}`);
                }
                break;
            case 'List containers': {
                await this.executeCommandWithOutput('docker', ['container', 'ls', '-a']);
                break;
            }
            case 'Back to main menu':
                return
        }
    }

    async manageDockerImages() {
        const answers = await inquirer.prompt({
            type: 'list',
            name: 'manageDockerImagesMainChoice',
            message: 'Which images would you like to remove?',
            choices: [
                'Remove all images',
                'Remove Dangling images',
                'Remove Specified images (you provide names)',
                'List images',
                'Back to main menu'
            ],
        });

        switch (answers.manageDockerImagesMainChoice) {
            case 'Remove all images': {
                const names = await this.executeCommand(`docker images --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`);
                if (!names) {
                    console.error('There are no images!')
                    return;
                }
                await this.executeCommand('docker stop $(docker ps -q)');
                await this.executeCommand('docker rm $(docker ps -aq)');
                await this.executeCommand('docker rmi -f $(docker images -aq)');
                console.log('All images have been deleted');
                break;

            }

            case 'Remove Dangling images': {
                const names = await this.executeCommand(`docker images -f "dangling=true" --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`);
                if (names.length === 0) {
                    console.log('There are no dangling images!');
                    return;
                }
                names.split(',').forEach(async (name) => {
                    await this.executeCommand(`docker rmi ${name}`);
                })

                console.log('All dangling images have been deleted');
                await this.executeCommandWithOutput('docker', ['image', 'ls', '-a']);
                break;
            }

            case 'Remove Specified images (you provide names)':
                const imageNames = await this.executeCommand(`docker images --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`);
                if (!imageNames) {
                    console.error('There are no images!');
                    break;
                }
                const { imagesToRemove } = await inquirer.prompt({
                    type: 'checkbox',
                    name: 'imagesToRemove',
                    message: 'Select images to remove:',
                    choices: imageNames.split(','),
                });

                for (const image of imagesToRemove) {
                    await this.executeCommand(`docker rmi -f ${image}`);
                }

                console.log('Your images after removal:');
                await this.executeCommandWithOutput('docker', ['image', 'ls']);
                break;

            case 'List images': {
                await this.executeCommandWithOutput('docker', ['image', 'ls', '-a']);
                break;
            }

            case 'Exit':
                return;
        }
    }

    async removeDockerUnusedResources() {
        const isConfirmed = await this.confirmPrompt('Are you sure? It will remove all unused resources!');
        if (isConfirmed) {
            await this.executeCommandWithOutput('docker', ['system', 'prune', '-f']);
        }
    }

    async attachContainer() {
        const containerNames = await this.getContainerNames();
        if (!containerNames.length) {
            console.error('No running containers found.');
            return;
        }
        const containerToAttach = await this.selectFromList('Select container to attach:', containerNames);
        await this.executeCommandWithOutput('docker', ['attach', containerToAttach]);
    }

    async enterContainerBash() {
        const containerNames = await this.getContainerNames();
        if (!containerNames.length) {
            console.error('No running containers found.');
            return;
        }
        const containerToEnterBash = await this.selectFromList('Select container to enter bash:', containerNames);
        await this.executeCommandWithOutput('docker', ['exec', '-it', containerToEnterBash, 'sh']);
    }

    async setEnvVariables() {
        const env = Object.create(process.env);
        env.PATH = `${env.PATH}:/usr/bin:/usr/sbin`;
    }

    async run() {
        this.setEnvVariables()
        const { mainChoice } = await inquirer.prompt(this.choices.mainChoice);
        switch (mainChoice) {
            case 'Run Docker':
                await this.runDocker();
                break;
            case 'Install Docker (only Ubuntu, preferred 22.04)':
                await this.installDocker();
                break;
            case 'Manage containers':
                await this.manageDockerContainers();
                break;
            case 'Manage images':
                await this.manageDockerImages();
                break;
            case 'Prune':
                await this.removeDockerUnusedResources();
                break;
            case 'Attach to a container':
                await this.attachContainer();
                break;
            case 'Enter container bash':
                await this.enterContainerBash();
                break;
            case 'Exit':
                process.exit();
        }
    }
}

const DockerManagerInstance = new DockerManager();
DockerManagerInstance.run();
