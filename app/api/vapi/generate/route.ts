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

        // MENGAMBIL DATA DARI STRUKTUR VAPI
        const args = body.message.toolCalls[0].function.arguments;
        const { type, role, level, techstack, amount, userid } = args;

        // Validasi minimal agar tidak undefined di Firestore
        if (!role || !userid) {
            throw new Error("Missing required fields: role or userid");
        }

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Return a JSON object with a key 'questions' containing an array of strings."
                },
                {
                    role: "user",
                    content: `Prepare ${amount} questions for a ${role} position. Level: ${level}. Tech: ${techstack}. Focus: ${type}.`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content || '{"questions": []}';
        const parsedData = JSON.parse(content);
        const parsedQuestions = Array.isArray(parsedData.questions) ? parsedData.questions : [];

        const interview = {
            role: role || "Unknown Role",
            type: type || "Mixed",
            level: level || "Junior",
            techstack: typeof techstack === 'string' ? techstack.split(',').map((s: string) => s.trim()) : techstack,
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("interviews").add(interview);

        return Response.json({ success: true, id: docRef.id }, { status: 200 });

    } catch (error: any) {
        console.error("Vapi/Groq/Firebase Error:", error);
        return Response.json({
            success: false,
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}