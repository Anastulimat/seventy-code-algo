declare module 'piston-client' {
    export interface ExecuteOptions {
        language: string;
        version: string;
        files: Array<{
            name?: string;
            content: string;
        }>;
        stdin?: string;
        args?: string[];
        compile_timeout?: number;
        run_timeout?: number;
        compile_memory_limit?: number;
        run_memory_limit?: number;
    }

    export interface ExecuteResult {
        language: string;
        version: string;
        run: {
            stdout: string;
            stderr: string;
            output: string;
            code: number;
            signal: string | null;
        };
        compile?: {
            stdout: string;
            stderr: string;
            output: string;
            code: number;
            signal: string | null;
        };
    }

    export interface Runtime {
        language: string;
        version: string;
        aliases: string[];
        runtime?: string;
    }

    export class PistonClient {
        constructor(url?: string);
        execute(options: ExecuteOptions): Promise<ExecuteResult>;
        runtimes(): Promise<Runtime[]>;
    }
}
