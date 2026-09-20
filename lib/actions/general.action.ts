'use server'
import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { feedbackSchema } from "@/constants";
import { groq } from "@ai-sdk/groq";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
        .collection('interviews')
        .where('interviewUserId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map((doc) => ({
        interviewId: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('interviewUserId', '==', userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        interviewId: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewsById(id: string): Promise<Interview | null> {
    const interview = await db
        .collection('interviews')
        .doc(id)
        .get();

    const data = interview.data();
    if (!data) return null;
    return { interviewId: id, ...data } as Interview;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;

    // Cek apakah fungsi dipanggil dan parameter yang diterima
    console.log('createFeedback dipanggil');
    console.log('interviewId:', interviewId);
    console.log('userId:', userId);
    console.log('transcript length:', transcript?.length);

    try {
        // Format transcript menjadi string yang bisa dibaca AI
        const formattedTranscript = transcript
            .map((sentence: { role: string; content: string }) => (
                `- ${sentence.role}: ${sentence.content}\n`
            )).join('');

        // Cek hasil format transcript
        console.log('formattedTranscript:', formattedTranscript);

        // Generate feedback menggunakan AI berdasarkan transcript
        const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
            model: groq('llama3-8b-8192'),
            schema: feedbackSchema,
            prompt: `
                You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
                Transcript:
                ${formattedTranscript}

                Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
                - **Communication Skills**: Clarity, articulation, structured responses.
                - **Technical Knowledge**: Understanding of key concepts for the role.
                - **Problem Solving**: Ability to analyze problems and propose solutions.
                - **Cultural Fit**: Alignment with company values and job role.
                - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.
            `,
            system:
                "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        });

        // Cek apakah generateObject berhasil menghasilkan data
        console.log('generateObject berhasil');
        console.log('totalScore:', totalScore);

        // Simpan feedback ke Firestore
        const feedback = await db.collection('feedback').add({
            feedbackInterviewId: interviewId,
            feedbackUserId: userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt: new Date().toISOString(),
        })

        // Cek apakah feedback berhasil tersimpan ke Firestore
        console.log('feedback tersimpan, id:', feedback.id);

        return {
            success: true,
            feedbackId: feedback.id
        }

    } catch (e) {
        // Tangkap error jika ada yang gagal di proses di atas
        console.error('Error saving feedback', e)
        return { success: false }
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const feedback = await db
        .collection('feedback')
        .where('feedbackInterviewId', '==', interviewId)
        .where('feedbackUserId', '==', userId)
        .limit(1)
        .get();

    // Kembalikan null jika feedback tidak ditemukan
    if (feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];
    return {
        feedbackId: feedbackDoc.id, ...feedbackDoc.data()
    } as Feedback;
}

export async function getAllFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback[] | null> {
    const { interviewId, userId } = params;

    try {
        const feedbackSnapshot = await db
            .collection('feedback')
            .where('feedbackInterviewId', '==', interviewId)
            .where('feedbackUserId', '==', userId)
            .orderBy('createdAt', 'asc')
            .limitToLast(5)
            .get();

        if (feedbackSnapshot.empty) return null;

        const feedbackList = feedbackSnapshot.docs.map((doc, index) => ({
            feedbackId: doc.id,
            ...doc.data(),
            attemptNumber: index + 1,
        })) as Feedback[];

        return feedbackList;
    } catch (error) {
        console.error('Error fetching all feedback by interviewId:', error);
        console.error('If you see a Firestore index error, follow the link in the error message above to create the required composite index.');
        return null;
    }
}