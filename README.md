## What is it used for?

This tool is designed to streamline the management of Docker.

## How to configure
1. Create a `.env` file. Use the `.env.default` file as a reference to understand what needs to be configured. There are two primary configurations to set:
   - Display names of your applications.
   - Commands to run those applications.

2. **Names**: 
   Set the `APP_NAMES` variable and list the display names, separated by commas.

3. **Commands**: 
   For each application name, define a variable in the `PREFIX_START_COMMAND` format. Here, "PREFIX" corresponds to the application name from `APP_NAMES`.

## How to use
Install required packages by running
```
npm i
```
Build project
```
npm run build
```
Link the project using the command:
```
npm link
```
Afterwards, you can use it globally by running:
```
dckr
```