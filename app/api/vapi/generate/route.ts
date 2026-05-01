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
        console.log("📦 RAW ARGUMENTS:", toolCall.function?.arguments);

        let args;
        try {
            args = JSON.parse(toolCall.function.arguments);
            console.log("✅ PARSED ARGS:", args);
        } catch (err) {
            console.error("❌ PARSE ERROR:", toolCall.function.arguments);
            return Response.json({ error: "Parse error" }, { status: 400 });
        }

        console.log("✅ PARSED ARGS:", args);

        let { type, role, level, techstack, amount, userid } = args;

        // ✅ fallback biar tidak gagal
        role = role || "Software Engineer";
        type = type || "Technical";
        level = level || "Junior";
        techstack = techstack || "General";
        amount = Number(amount) || 5;

        if (!userid) {
            return Response.json({
                error: "Missing userid"
            }, { status: 400 });
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