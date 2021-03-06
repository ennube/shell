import {Shell, Manager, manager, command} from './shell';
import {allServiceDescriptors, mainEntry} from '@ennube/runtime';
import * as fs from 'fs-extra';
import * as _ from 'lodash';

export type TemplateCollection = {
    [mimeType:string]: {
        [templateId:string]: string
    }
};

@manager(Shell)
export class Project implements Manager {
    npm: {
        name: string,
        version: string,
        main: string
    };

    tsc: {
        compilerOptions: {
            outDir: string;
            rootDir: string;
            module: string; // for webpack target
        };
    };

    mainModule: Object;

    serviceModules: {
        [name:string]: string
    } = {};

    templates: {
        request: TemplateCollection,
        response: TemplateCollection
    } = {
        request: {},
        response: {}
    };

    directory: string;
    constructor(shell: Shell) {
        this.directory = shell.projectDir;

        // ensureNpmLoaded

        let npmFileName = `${this.directory}/package.json`;
        if( fs.existsSync(npmFileName) )
            this.npm = fs.readJSONSync(npmFileName);
        else
            throw new Error(`You must run ennube into a npm inited directory`)

        // TODO: npm checks


        // ensureTscLoaded

        let tscFileName = `${this.directory}/tsconfig.json`;
        if( fs.existsSync(tscFileName) )
            this.tsc = fs.readJSONSync(tscFileName);
        else
            throw new Error(`You must run ennube into a tsc inited directory`)
        // TODO: tsc checks

    }

    get name() {
        if( this.npm === undefined )
            throw new Error('you must ensureNpmLoaded before get project.name');
        return this.npm.name;
    }
    get mainModuleFileName() {
        if( this.npm === undefined )
            throw new Error('you must ensureNpmLoaded before get project.mainModuleFileName');
        return `${this.directory}/${this.npm.main}`;
    }
    get sourceDir() {
        return _.trimEnd(`${this.directory}/${this.tsc.compilerOptions.rootDir}`, '/');
    }
    get outDir() {
        return _.trimEnd(`${this.directory}/${this.tsc.compilerOptions.outDir}`, '/');
    }
    get buildDir() {
        return `${this.directory}/build`;
    }
    get packingDir() {
        return `${this.buildDir}/packing`;
    }
    get deploymentDir() {
        return `${this.buildDir}/deployment`;
    }


    ensureLoaded() {
        // ensure builded, require Builder here..
        if(!this.mainModule) {
            console.log('Loading project...');
            // ... config process.env variables...
            this.mainModule = require(this.mainModuleFileName);
            // another checks here...
            this.discoverServices();
        }
    }

    discoverServices() {
        this.ensureLoaded();

        for(let moduleId in require.cache ) {
            let module = require.cache[moduleId];

            if(!module.filename.startsWith(this.directory))
                continue;

            for(let serviceName in allServiceDescriptors ) {
                let serviceClass = allServiceDescriptors[serviceName].serviceClass;

                if( serviceName in module.exports &&
                    serviceClass === module.exports[serviceClass.name]) {
                    console.log(`service ${serviceClass.name} found in ` +
                                module.filename.substr(this.outDir.length));

                    if( !('mainEntry' in module.exports) ||
                        module.exports.mainEntry !== mainEntry )
                        throw new Error(`Service module ${moduleId} must ` +
                            `export {mainEntry} from '@ennube/runtime'`);

                    this.serviceModules[serviceName] = module.filename;
                }
            }
        }
    }


}
