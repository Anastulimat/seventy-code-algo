import {prisma} from "@/lib/prisma";
import {Difficulty} from "@/lib/generated/prisma/enums";


async function main() {
    console.log("🌱 Starting seed...");

    // Créer des tags
    const tags = await Promise.all([
        prisma.tag.upsert({
            where: {slug: "array"},
            update: {},
            create: {name: "Array", slug: "array"},
        }),
        prisma.tag.upsert({
            where: {slug: "string"},
            update: {},
            create: {name: "String", slug: "string"},
        }),
        prisma.tag.upsert({
            where: {slug: "hash-table"},
            update: {},
            create: {name: "Hash Table", slug: "hash-table"},
        }),
        prisma.tag.upsert({
            where: {slug: "dynamic-programming"},
            update: {},
            create: {name: "Dynamic Programming", slug: "dynamic-programming"},
        }),
        prisma.tag.upsert({
            where: {slug: "math"},
            update: {},
            create: {name: "Math", slug: "math"},
        }),
        prisma.tag.upsert({
            where: {slug: "sorting"},
            update: {},
            create: {name: "Sorting", slug: "sorting"},
        }),
        prisma.tag.upsert({
            where: {slug: "greedy"},
            update: {},
            create: {name: "Greedy", slug: "greedy"},
        }),
        prisma.tag.upsert({
            where: {slug: "binary-search"},
            update: {},
            create: {name: "Binary Search", slug: "binary-search"},
        }),
    ]);

    console.log("✅ Tags created");

    // Créer un problème exemple : Two Sum
    const twoSum = await prisma.problem.upsert({
        where: {slug: "two-sum"},
        update: {},
        create: {
            title: "Two Sum",
            slug: "two-sum",
            difficulty: Difficulty.Easy,
            order: 1,
            acceptance: 49.5,
            description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
            constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
            examples: {
                create: [
                    {
                        input: "nums = [2,7,11,15], target = 9",
                        output: "[0,1]",
                        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
                        order: 1,
                    },
                    {
                        input: "nums = [3,2,4], target = 6",
                        output: "[1,2]",
                        explanation: "",
                        order: 2,
                    },
                    {
                        input: "nums = [3,3], target = 6",
                        output: "[0,1]",
                        explanation: "",
                        order: 3,
                    },
                ],
            },
            testCases: {
                create: [
                    {
                        input: JSON.stringify({nums: [2, 7, 11, 15], target: 9}),
                        expectedOutput: JSON.stringify([0, 1]),
                        isHidden: false,
                        order: 1,
                    },
                    {
                        input: JSON.stringify({nums: [3, 2, 4], target: 6}),
                        expectedOutput: JSON.stringify([1, 2]),
                        isHidden: false,
                        order: 2,
                    },
                    {
                        input: JSON.stringify({nums: [3, 3], target: 6}),
                        expectedOutput: JSON.stringify([0, 1]),
                        isHidden: false,
                        order: 3,
                    },
                    {
                        input: JSON.stringify({nums: [1, 2, 3, 4, 5], target: 9}),
                        expectedOutput: JSON.stringify([3, 4]),
                        isHidden: true,
                        order: 4,
                    },
                ],
            },
            tags: {
                create: [
                    {tagId: tags.find((t) => t.slug === "array")!.id},
                    {tagId: tags.find((t) => t.slug === "hash-table")!.id},
                ],
            },
        },
    });

    console.log("✅ Two Sum problem created");

    // Créer un problème de difficulté moyenne
    const addTwoNumbers = await prisma.problem.upsert({
        where: {slug: "add-two-numbers"},
        update: {},
        create: {
            title: "Add Two Numbers",
            slug: "add-two-numbers",
            difficulty: Difficulty.MEDIUM,
            order: 2,
            acceptance: 39.8,
            description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
            constraints: `- The number of nodes in each linked list is in the range [1, 100].
- 0 <= Node.val <= 9
- It is guaranteed that the list represents a number that does not have leading zeros.`,
            examples: {
                create: [
                    {
                        input: "l1 = [2,4,3], l2 = [5,6,4]",
                        output: "[7,0,8]",
                        explanation: "342 + 465 = 807.",
                        order: 1,
                    },
                ],
            },
            testCases: {
                create: [
                    {
                        input: JSON.stringify({l1: [2, 4, 3], l2: [5, 6, 4]}),
                        expectedOutput: JSON.stringify([7, 0, 8]),
                        isHidden: false,
                        order: 1,
                    },
                ],
            },
            tags: {
                create: [
                    {tagId: tags.find((t) => t.slug === "math")!.id},
                ],
            },
        },
    });

    console.log("✅ Add Two Numbers problem created");

    console.log("🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
