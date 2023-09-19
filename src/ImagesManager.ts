import { checkbox, select } from "@inquirer/prompts";
import { Choicer } from "./Choicer";
import { CliManager } from "./CliManager";
import { ImagesRemoveActions } from "../types";

export class ImagesManager extends CliManager{
    public async list() {
        await this.executeCommandWithOutput('docker', ['image', 'ls', '-a']);
        return;
    }

    public async remove() {
        const choicer = new Choicer<ImagesRemoveActions>('What to do?', Object.keys(ImagesRemoveActions) as ImagesRemoveActions[]);
        const data = await select(choicer.inqSelectConfig)

        switch(data) {
            case ImagesRemoveActions.All: {
                const list = (await this.executeCommand(`docker images --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`)) as string;
                if (list.length === 0) {
                    console.log('There are no images!');
                    return;
                }

                list.split(',').forEach(async (name) => {
                    await this.executeCommand(`docker rmi -f ${name}`);
                })
     
                console.log('All images have been deleted');
                break;
            }
            case ImagesRemoveActions.Dangling: {
                const list = (await this.executeCommand(`docker images -f "dangling=true" --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`)) as string;
                if (list.length === 0) {
                    console.log('There are no dangling images!');
                    return;
                }
                list.split(',').forEach(async (name) => {
                    await this.executeCommand(`docker rmi ${name}`);
                })
                console.log('All dangling images have been deleted');
                break;
            }
            case ImagesRemoveActions.Specific: {
                const list = (await this.executeCommand(`docker images --format '{{.Repository}}:{{.Tag}}' | paste -sd ","`)) as string;
                if (list.length === 0) { console.log('There are no images!'); return; }

                const data = await checkbox({
                    message: 'Select containers to remove', choices: list.split(',').map((choice) => ({ value: choice, message: choice}))
                })

                data.forEach(async (name) => {
                    await this.executeCommand(`docker rmi -f ${name}`);
                })
                console.log('Removed images:', data.join(','))
                break;
            }
        }
    }
}