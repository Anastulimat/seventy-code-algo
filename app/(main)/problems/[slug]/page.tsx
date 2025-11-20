import {getProblemBySlug} from "@/actions/problems";
import {ProblemFull} from "@/types";
import {ProblemWorkspace} from "@/components/problems/problem-workspace";

// ----------------------------------------------------------------------

type Params = Promise<{ slug: string }>;

// ----------------------------------------------------------------------

export default async function ProblemPage({params}: { params: Params }) {
    const {slug} = await params;
    const {data: problem} = await getProblemBySlug(slug);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            <ProblemWorkspace problem={problem as ProblemFull}/>
        </div>
    );
}
