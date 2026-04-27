import OpenAI from "openai";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Inisialisasi client Groq menggunakan library OpenAI
const client = new OpenAI({
    // Pastikan nama variabel di .env.local sesuai
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU' }, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const { type, role, level, techstack, amount, userid } = await request.json();

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a professional technical interviewer. You must return ONLY a raw JSON array of strings. No markdown, no conversational text, no pre-amble."
                },
                {
                    role: "user",
                    content: `Prepare ${amount} questions for a ${role} position.
                    Experience Level: ${level}.
                    Tech Stack: ${techstack}.
                    Focus: ${type}.

                    Rules:
                    1. Return ONLY the questions in this format: ["Question 1", "Question 2"]
                    2. Avoid special characters like '/', '*', or complex symbols.
                    3. No additional text or greetings.`
                }
            ],
            // Memaksa Groq untuk memberikan format JSON (jika didukung oleh model spesifik tersebut)
            response_format: { type: "json_object" }
        });

        let questionsText = completion.choices[0].message.content || "[]";

        // Membersihkan teks jika model secara tidak sengaja memberikan markdown (misal ```json ... ```)
        questionsText = questionsText.replace(/```json|```/g, "").trim();

        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(questionsText);
            // Jika hasilnya objek dengan key tertentu, ambil array-nya
            if (!Array.isArray(parsedQuestions) && typeof parsedQuestions === 'object') {
                parsedQuestions = Object.values(parsedQuestions)[0];
            }
        } catch (e) {
            console.error("Parsing Error:", e);
            parsedQuestions = ["Could you tell me about your experience with " + techstack + "?"];
        }

        const interview = {
            role,
            type,
            level,
            // Menghindari error jika techstack sudah berupa array
            techstack: typeof techstack === 'string' ? techstack.split(',').map(s => s.trim()) : techstack,
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        // Simpan ke Firestore via Firebase Admin
        const docRef = await db.collection("interviews").add(interview);

        return Response.json({ success: true, id: docRef.id }, { status: 200 });

    } catch (error: any) {
        console.error("Groq/Firebase Error:", error);
        return Response.json({
            success: false,
            error: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}