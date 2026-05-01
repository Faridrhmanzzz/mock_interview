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

        // 1. Ekstraksi Tool Call dari Vapi
        const toolCall = body.message.toolCalls?.[0];

        if (!toolCall) {
            console.error("No tool call detected in request body");
            return Response.json({ error: "No tool call found" }, { status: 400 });
        }

        // 2. Ambil argumen yang dikirim AI
        const { type, role, level, techstack, amount, userid } = toolCall.function.arguments;

        // Debugging: Cek data di log Vercel
        console.log("Payload diterima:", { role, techstack, userid });

        // 3. Validasi ketat agar Firestore tidak crash
        if (!role || !userid) {
            return Response.json({
                error: "Missing required fields",
                details: `Role: ${role}, UserID: ${userid}`
            }, { status: 400 });
        }

        // 4. Generate Pertanyaan via Groq
        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Return a JSON object with a key 'questions' containing an array of strings."
                },
                {
                    role: "user",
                    content: `Generate ${amount || 5} interview questions for ${role} position. Tech: ${techstack}. Level: ${level}. Focus: ${type}.`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content || '{"questions": []}';
        const parsedData = JSON.parse(content);
        const parsedQuestions = Array.isArray(parsedData.questions) ? parsedData.questions : [];

        // 5. Susun objek untuk Firestore
        const interviewData = {
            role: role,
            type: type || "Mixed",
            level: level || "Junior",
            // Pastikan techstack jadi array
            techstack: typeof techstack === 'string' ? techstack.split(',').map((s: string) => s.trim()) : techstack,
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        // 6. Simpan ke Firebase Admin
        const docRef = await db.collection("interviews").add(interviewData);

        // 7. Berikan respon sukses ke Vapi
        return Response.json({
            result: "success",
            message: "Interview created successfully",
            id: docRef.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Critical Error in route.ts:", error);
        return Response.json({
            success: false,
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}