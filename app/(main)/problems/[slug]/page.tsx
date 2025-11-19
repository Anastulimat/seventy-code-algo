import {getProblemBySlug} from "@/actions/problems";
import {ProblemFull} from "@/types";
import {ProblemWorkspace} from "@/components/problems/problem-workspace";

// ----------------------------------------------------------------------

type Params = Promise<{ slug: string }>;

// ----------------------------------------------------------------------


export default async function ProblemPage({params}: { params: Params }) {
    const {slug} = await params;
    const {data: problem} = await getProblemBySlug(slug);

    return <ProblemWorkspace problem={problem as ProblemFull}/>;
}
