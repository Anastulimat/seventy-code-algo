// lib/piston.ts
interface ExecuteOptions {
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
}

interface ExecuteResult {
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
    };
}

interface Runtime {
    language: string;
    version: string;
    aliases: string[];
}

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export async function executeCode(
    language: string,
    version: string,
    code: string,
    stdin?: string
): Promise<{
    success: boolean;
    output?: string;
    stderr?: string;
    stdout?: string;
    code?: number;
    error?: string;
}> {
    try {
        const response = await fetch(`${PISTON_API_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language,
                version,
                files: [
                    {
                        content: code,
                    },
                ],
                stdin: stdin || '',
            } as ExecuteOptions),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ExecuteResult = await response.json();

        return {
            success: true,
            output: result.run.output,
            stderr: result.run.stderr,
            stdout: result.run.stdout,
            code: result.run.code,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function getRuntimes(): Promise<Runtime[]> {
    try {
        const response = await fetch(`${PISTON_API_URL}/runtimes`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching runtimes:', error);
        return [];
    }
}

// Helper pour obtenir la dernière version d'un langage
export async function getLatestVersion(language: string): Promise<string | null> {
    const runtimes = await getRuntimes();
    const runtime = runtimes.find(
        (r) => r.language === language || r.aliases.includes(language)
    );
    return runtime?.version || null;
}
