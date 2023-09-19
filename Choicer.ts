type ChoicerType = 'list'

export class Choicer<T> {
    private readonly type: ChoicerType;
    private readonly name: string;
    private readonly message: string;
    private readonly choices: T[];

    constructor(type: ChoicerType, name: string, message: string, choices: T[]) {
        this.type = type;
        this.name = name;
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
