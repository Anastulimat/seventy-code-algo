import {NextRequest, NextResponse} from 'next/server';
import {executeCode} from '@/lib/piston';

export async function POST(request: NextRequest) {
    try {
        const {language, version, code, stdin, testCases} = await request.json();

        if (!testCases) {
            const result = await executeCode(language, version, code, stdin);
            return NextResponse.json(result);
        }

        // Exécution avec test cases
        const results = await Promise.all(
            testCases.map(async (testCase: { input: string; expected: string }) => {
                const result = await executeCode(language, version, code, testCase.input);
                const output = result.output?.trim() || '';
                const expected = testCase.expected.trim();

                return {
                    input: testCase.input,
                    expected,
                    output,
                    passed: output === expected,
                    success: result.success,
                    stderr: result.stderr,
                };
            })
        );

        return NextResponse.json({
            success: true,
            results,
            allPassed: results.every((r) => r.passed),
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {status: 500}
        );
    }
}
