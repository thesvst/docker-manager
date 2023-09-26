"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Choicer = void 0;
class Choicer {
    constructor(message, choices) {
        this.message = message;
        this.choices = choices;
    }
    get inqSelectConfig() {
        return {
            message: this.message,
            choices: this.choices.map((choice) => ({ value: choice, message: choice }))
        };
    }
}
exports.Choicer = Choicer;
