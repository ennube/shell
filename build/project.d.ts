import { Shell, Manager } from './shell';
export declare type TemplateCollection = {
    [mimeType: string]: {
        [templateId: string]: string;
    };
};
export declare class Project implements Manager {
    npm: {
        name: string;
        version: string;
        main: string;
    };
    tsc: {
        compilerOptions: {
            outDir: string;
            rootDir: string;
            module: string;
        };
    };
    mainModule: Object;
    serviceModules: {
        [name: string]: string;
    };
    templates: {
        request: TemplateCollection;
        response: TemplateCollection;
    };
    directory: string;
    constructor(shell: Shell);
    readonly name: string;
    readonly mainModuleFileName: string;
    readonly sourceDir: string;
    readonly outDir: string;
    readonly buildDir: string;
    readonly packingDir: string;
    readonly deploymentDir: string;
    ensureLoaded(): void;
    discoverServices(): void;
}
