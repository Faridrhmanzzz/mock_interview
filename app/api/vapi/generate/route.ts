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

        // 1. EKSTRAKSI ARGUMEN DARI STRUKTUR WEBHOOK VAPI
        const toolCall = body.message.toolCalls?.[0];
        if (!toolCall) {
            throw new Error("No tool call found in the request");
        }

        const { type, role, level, techstack, amount, userid } = toolCall.function.arguments;

        // 2. VALIDASI DATA MINIMAL
        if (!role || !userid) {
            console.error("Missing Data:", { role, userid });
            return Response.json({ error: "Role and UserID are required" }, { status: 400 });
        }

        // 3. GENERATE PERTANYAAN VIA GROQ (LLAMA 3.1)
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

        // 4. STRUKTUR DATA UNTUK FIRESTORE
        const interview = {
            role: role || "Software Engineer",
            type: type || "Mixed",
            level: level || "Junior",
            techstack: typeof techstack === 'string' ? techstack.split(',').map((s: string) => s.trim()) : techstack,
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        // 5. SIMPAN KE FIRESTORE
        const docRef = await db.collection("interviews").add(interview);

        // 6. RESPON UNTUK VAPI (PENTING AGAR TIDAK ERROR "NO RESULT RETURNED")
        return Response.json({
            result: "success",
            message: `Interview template created with ID: ${docRef.id}`
        }, { status: 200 });

    } catch (error: any) {
        console.error("Vapi/Groq/Firebase Error:", error);
        return Response.json({
            success: false,
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}