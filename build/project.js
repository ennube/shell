"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var shell_1 = require('./shell');
var runtime_1 = require('@ennube/runtime');
var fs = require('fs-extra');
var _ = require('lodash');
var Project = (function () {
    function Project(shell) {
        this.serviceModules = {};
        this.templates = {
            request: {},
            response: {}
        };
        this.directory = shell.projectDir;
        // ensureNpmLoaded
        var npmFileName = this.directory + "/package.json";
        if (fs.existsSync(npmFileName))
            this.npm = fs.readJSONSync(npmFileName);
        else
            throw new Error("You must run ennube into a npm inited directory");
        // TODO: npm checks
        // ensureTscLoaded
        var tscFileName = this.directory + "/tsconfig.json";
        if (fs.existsSync(tscFileName))
            this.tsc = fs.readJSONSync(tscFileName);
        else
            throw new Error("You must run ennube into a tsc inited directory");
        // TODO: tsc checks
    }
    Object.defineProperty(Project.prototype, "name", {
        get: function () {
            if (this.npm === undefined)
                throw new Error('you must ensureNpmLoaded before get project.name');
            return this.npm.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "mainModuleFileName", {
        get: function () {
            if (this.npm === undefined)
                throw new Error('you must ensureNpmLoaded before get project.mainModuleFileName');
            return this.directory + "/" + this.npm.main;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "sourceDir", {
        get: function () {
            return _.trimEnd(this.directory + "/" + this.tsc.compilerOptions.rootDir, '/');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "outDir", {
        get: function () {
            return _.trimEnd(this.directory + "/" + this.tsc.compilerOptions.outDir, '/');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "buildDir", {
        get: function () {
            return this.directory + "/build";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "packingDir", {
        get: function () {
            return this.buildDir + "/packing";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "deploymentDir", {
        get: function () {
            return this.buildDir + "/deployment";
        },
        enumerable: true,
        configurable: true
    });
    Project.prototype.ensureLoaded = function () {
        // ensure builded, require Builder here..
        if (!this.mainModule) {
            console.log('Loading project...');
            // ... config process.env variables...
            this.mainModule = require(this.mainModuleFileName);
            // another checks here...
            this.discoverServices();
        }
    };
    Project.prototype.discoverServices = function () {
        this.ensureLoaded();
        for (var moduleId in require.cache) {
            var module_1 = require.cache[moduleId];
            if (!module_1.filename.startsWith(this.directory))
                continue;
            for (var serviceName in runtime_1.allServiceDescriptors) {
                var serviceClass = runtime_1.allServiceDescriptors[serviceName].serviceClass;
                if (serviceName in module_1.exports &&
                    serviceClass === module_1.exports[serviceClass.name]) {
                    console.log(("service " + serviceClass.name + " found in ") +
                        module_1.filename.substr(this.outDir.length));
                    if (!('mainEntry' in module_1.exports) ||
                        module_1.exports.mainEntry !== runtime_1.mainEntry)
                        throw new Error(("Service module " + moduleId + " must ") +
                            "export {mainEntry} from '@ennube/runtime'");
                    this.serviceModules[serviceName] = module_1.filename;
                }
            }
        }
    };
    Project = __decorate([
        shell_1.manager(shell_1.Shell), 
        __metadata('design:paramtypes', [shell_1.Shell])
    ], Project);
    return Project;
}());
exports.Project = Project;
//# sourceMappingURL=project.js.map