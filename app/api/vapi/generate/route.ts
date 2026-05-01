import OpenAI from "openai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("🔥 FULL BODY:", JSON.stringify(body, null, 2));
        const toolCall =
            body.message?.toolCalls?.[0] ||
            body.toolCall ||
            body.toolCalls?.[0];
        console.log("🧩 TOOL CALL:", JSON.stringify(toolCall, null, 2));

        if (!toolCall) {
            console.error("❌ TOOL TIDAK TERPANGGIL");
            return Response.json({ error: "No tool call" }, { status: 400 });
        }

        //
        const rawArgs =
            toolCall.function?.arguments ??
            toolCall.arguments;

        if (!rawArgs) {
            return Response.json({ error: "No arguments" }, { status: 400 });
        }

        let args: any;

        if (typeof rawArgs === "string") {
            try {
                args = JSON.parse(rawArgs);
            } catch {
                return Response.json(
                    { error: "Invalid arguments JSON" },
                    { status: 400 }
                );
            }
        } else if (typeof rawArgs === "object") {
            args = rawArgs;
        } else {
            return Response.json(
                { error: "Invalid arguments type" },
                { status: 400 }
            );
        }
        //

        let { type, role, level, techstack, amount } = args;

        const userid =
            body.message?.artifact?.variableValues?.userid ||
            body.message?.variableValues?.userid ||
            body.message?.call?.assistantOverrides?.variableValues?.userid ||
            body.message?.assistant?.variableValues?.userid ||
            body.call?.assistantOverrides?.variableValues?.userid ||
            body.assistant?.variableValues?.userid;

        if (!userid) {
            return Response.json(
                { error: "Missing Firebase login user id" },
                { status: 400 }
            );
        }

        // ✅ Generate pertanyaan
        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Return a JSON object with key 'questions' (array of strings)."
                },
                {
                    role: "user",
                    content: `Generate ${amount} interview questions for ${role}. Tech: ${techstack}. Level: ${level}. Type: ${type}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content || "{}";

        let questions: string[] = [];

        try {
            const parsed = JSON.parse(content);
            questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        } catch (err) {
            console.error("❌ AI JSON parse error:", content);
        }

        const interviewData = {
            role,
            type,
            level,
            techstack: typeof techstack === "string"
                ? techstack.split(",").map((s: string) => s.trim())
                : [],
            questions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("interviews").add(interviewData);

        console.log("✅ FIREBASE SUCCESS:", docRef.id);

        return Response.json({
            success: true,
            id: docRef.id
        });

    } catch (error: any) {
        console.error("🔥 CRITICAL ERROR:", error);
        return Response.json({
            success: false,
            error: error?.message
        }, { status: 500 });
    }
}