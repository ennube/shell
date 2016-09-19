"use strict";
var yargs = require('yargs');
var _ = require('lodash');
var runtime_1 = require('@ennube/runtime');
var Shell = (function () {
    function Shell(project) {
        this.project = project;
        this.commandServices = new Map;
        this.commandServices.set(Shell, this);
    }
    Shell.command = function (command, description, builder) {
        return function (prototype, methodName, descriptor) {
            Shell.commands[command] = {
                constructor: prototype.constructor,
                methodName: methodName, descriptor: descriptor, description: description, builder: builder
            };
        };
    };
    Shell.prototype.run = function () {
        var _this = this;
        var shell = this;
        yargs.usage('$0 <command>');
        _.forOwn(Shell.commands, function (info, command) {
            yargs.command(command, info.description, info.builder, function (args) {
                var commandService = _this.commandServices.get(info.constructor);
                if (commandService === undefined)
                    commandService = new info.constructor(_this.project);
                try {
                    var result = commandService[info.methodName](args);
                    if (runtime_1.typeOf(result) === Promise)
                        result
                            .then(function (x) { return console.log('OK', x); })
                            .catch(function (x) { return console.log('ER', x); });
                }
                catch (e) {
                    console.log(e);
                }
            });
        });
        yargs
            .fail(function (msg) {
            var err = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                err[_i - 1] = arguments[_i];
            }
            if (err[0])
                throw err[0];
            console.error(msg);
            process.exit(1);
        });
        return yargs.help().argv;
    };
    Shell.commands = {};
    return Shell;
}());
exports.Shell = Shell;
;
//# sourceMappingURL=shell.js.map