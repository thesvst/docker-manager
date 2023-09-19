# What is it used for?

This tool is used to speed up managing docker

# How to configure
1. Create a .env file. Use the .env.default file as a reference for what you need to configure. There are two primary configurations:
* Display names of your applications
* Commands to run those applications

2. Names: Define the APP_NAMES variable and list the display names, separated by commas.

3. Commands: For each application name, define a variable in the format PREFIX_START_COMMAND. Here "PREFIX" corresponds to the application
name from the "APP"NAMES".

# How to use
Link the project by command
```
npm link
```

You can use it globally by running
```
dckr
```