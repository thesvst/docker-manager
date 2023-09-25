import { CliManager } from "./CliManager";
export class AppManager extends CliManager {
    private readonly apps: string;

    constructor() {
        super();
        this.apps = process.env.APP_NAMES as string;
    }
    
    get appNames() {
        return this.apps.split(',')
    }

    public async runApp(name: string) {
        const envCommand = process.env[`${name.toUpperCase()}_START_COMMAND`];

        if (envCommand?.includes('npm')) {
            const commandToRun = `newgrp docker <<EOL\n${envCommand}\nEOL`;
            const [command, ...args] = commandToRun.split(' ');
            await this.executeCommandWithOutput(command, args, true);

        } else if (envCommand) {
            await this.executeCommandWithOutput(envCommand, [], true);
        }
    }
}