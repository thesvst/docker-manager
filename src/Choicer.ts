export class Choicer<T> {
    private readonly message: string;
    private readonly choices: T[];

    constructor(message: string, choices: T[]) {
        this.message = message;
        this.choices = choices;
    }

    get inqSelectConfig() {
        return {
            message: this.message,
            choices: this.choices.map((choice) => ({ value: choice, message: choice }))
        }
    }
}
