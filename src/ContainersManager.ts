import { Choicer } from "./Choicer";
import { CliManager } from "./CliManager";
import { checkbox, select } from '@inquirer/prompts';
import { ContainersRemoveActions, ContainersStartActions, ContainersStopActions } from "../types";

export class ContainersManager extends CliManager {

    public async getContainerNames(): Promise<string[]> {
        const names = await this.executeCommand(`docker ps --format '{{.Names}}' | paste -sd ","`) as string;
        if (names.length === 0) return []
        return names.split(',');
    }

    public async start() {
        const choicer = new Choicer<ContainersStartActions>('What to do?', Object.keys(ContainersStartActions) as ContainersStartActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ContainersStartActions.Specific: {
                const list = (await this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`)) as string;
                if (list.length === 0) { console.log('There are no stopped containers!'); return; }

                const data = await checkbox({
                    message: 'Select containers to start', choices: list.split(',').map((choice) => ({ value: choice, message: choice}))
                })
                data.forEach(async (name) => { await this.executeCommand(`docker start ${name}`) })
                break;
            }
            case ContainersStartActions.Stopped: {
                const list = (await this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`)) as string;
                if (list.length === 0) { console.log('There are no stopped containers!'); return; }
                list.split(',').forEach(async (name) => { await this.executeCommand(`docker start ${name}`) })
                console.log('Started containers:', list)
                break;
            }
        }
    }

    public async list() {
        await this.executeCommandWithOutput('docker', ['container', 'ls', '-a']);
        return;
    }

    public async remove() {
        const choicer = new Choicer<ContainersRemoveActions>('What to do?', Object.keys(ContainersRemoveActions) as ContainersRemoveActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ContainersRemoveActions.Running: {
                const list = await this.getContainerNames();
                if (list.length === 0) { console.log('There are no running containers!'); return; }
                list.forEach(async (name) => {
                    await this.executeCommand(`docker stop ${name}`) 
                    await this.executeCommand(`docker rm ${name}`) 
                })
                console.log('Removed containers:', list.join(','))
                break;
            }
            case ContainersRemoveActions.Stopped: {
                const list = (await this.executeCommand(`docker ps -a --filter "status=exited" --format '{{.Names}}' | paste -sd ","`)) as string;
                if (list.length === 0) { console.log('There are no stopped containers!'); return; }

                list.split(',').forEach(async (name) => {
                    await this.executeCommand(`docker stop ${name}`) 
                    await this.executeCommand(`docker rm ${name}`) 
                })
                console.log('Removed containers:', list)
                break;
            }
            case ContainersRemoveActions.Specific: {
                const list = await this.getContainerNames();
                if (list.length === 0) { console.log('There are no containers!'); return; }

                const data = await checkbox({
                    message: 'Select containers to remove', choices: list.map((choice) => ({ value: choice, message: choice}))
                })
                data.forEach(async (name) => {
                    await this.executeCommand(`docker stop ${name}`) 
                    await this.executeCommand(`docker rm ${name}`) 
                })
                console.log('Removed containers:', data.join(','))
                break;
            }
        }
    }

    public async stop() {
        const choicer = new Choicer<ContainersStopActions>('What to do?', Object.keys(ContainersStopActions) as ContainersStopActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ContainersStopActions.Running: {
                const list = await this.getContainerNames();
                if (list.length === 0) { console.log('There are no running containers!'); return; }
                list.forEach(async (name) => {
                    await this.executeCommand(`docker stop ${name}`) 
                })
                console.log('Stopped containers:', list.join(','))
                break;
            }

            case ContainersStopActions.Specific: {
                const list = await this.getContainerNames();
                if (list.length === 0) { console.log('There are no containers!'); return; }

                const data = await checkbox({
                    message: 'Select containers to remove', choices: list.map((choice) => ({ value: choice, message: choice}))
                })
                data.forEach(async (name) => {
                    await this.executeCommand(`docker stop ${name}`) 
                })
                console.log('Stopped containers:', list.join(','))
                break;
            }
        }
    }
}