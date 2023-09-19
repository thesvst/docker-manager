import { exec, spawn } from 'child_process';
import inquirer from 'inquirer';

export class CliManager {
    public async executeCommand(command: string) {
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

    public async executeCommandCopyOutput(command: string, args: string[], shell = false) {
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


    public async executeCommandWithOutput(command: string, args: string[], shell = false) {
        return new Promise((resolve, reject) => {
            const spawnedProcess = spawn(command, args, { stdio: 'inherit', shell });

            spawnedProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`Process finished`);
                    resolve('Process finished');
                } else {
                    reject(new Error(`Process exited with code: ${code}`));
                }
            });
        });
    }

    public async confirmPrompt(message: string) {
        const { confirm } = await inquirer.prompt({
            type: 'confirm', name: 'confirm', message, default: false,
        });

        return confirm;
    }
}