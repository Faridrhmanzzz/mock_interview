'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from '@/lib/vapi.sdk';
import {interviewer} from "@/constants"
import {createFeedback} from "@/lib/actions/general.action";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

interface AgentProps {
    userName: string;
    userId: string;
    type?: string;
    role?: string;
    level?: string;
    techstack?: string;
}

const Agent = ({
                   userName,
                   userId,
                   type,
                   interviewId,
                   questions,
                   role,
                   level,
                   techstack
               }: AgentProps) => {

    const router = useRouter();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    // 🔥 HANDLE EVENTS VAPI
    useEffect(() => {

        const onCallStart = () => {
            console.log("✅ Call started");
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            console.log("📴 Call ended");
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: any) => {
            console.log("📩 MESSAGE:", message);

            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage: SavedMessage = {
                    role: message.role,
                    content: message.transcript
                };

                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (err: any) => {
            console.error("🔥 VAPI ERROR:", JSON.stringify(err, null, 2));
            console.error("Error keys:", Object.keys(err));
            console.error("Error message:", err?.message);
            console.error("Error code:", err?.code || err?.statusCode);
            setError("Terjadi kesalahan saat call.");
            setCallStatus(CallStatus.FINISHED);
        };

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };

    }, []);

    const handleGenerateFeedback = async (messages: SavedMessage) => {
        console.log('Generate feedback here.');

        // TODO : Create a server action that generates feedback
        const {success, feedbackId: id} = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages
        })

        if (success && id){
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log('Error saving feedback');
            router.push('/');
        }
    }
    // 🔁 REDIRECT SETELAH CALL SELESAI
    useEffect(() => {
        if (callStatus === CallStatus.FINISHED){
            if (type === 'generate'){
                router.push('/')
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [callStatus, router]);

    // 🚀 START CALL
    const handleCall = async () => {
        try {
            setError(null);
            setCallStatus(CallStatus.CONNECTING);

            if (type === 'generate'){
                // Tambahkan ini sementara di handleCall sebelum vapi.start
                console.log("Assistant ID:", process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
                await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
                    variableValues: {
                        username: userName,
                        userid: userId,

                        // 🔥 Optional tapi bantu AI
                        role: role || "",
                        type: type || "",
                        level: level || "",
                        techstack: techstack || "",
                        amount: 5
                    }
                })
            } else {
                let formattedQuestions = '';

                if (questions) {
                    formattedQuestions = questions
                        .map((question) => `- ${question}`)
                        .join('\n');
                }

                await vapi.start(interviewer, {
                    variableValues: {
                        questions: formattedQuestions
                    }
                })
            }


        } catch (err) {
            console.error("❌ Failed to start call:", err);
            setError("Gagal memulai panggilan.");
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    // 🛑 STOP CALL
    const handleDisconnect = () => {
        try {
            vapi.stop();
            setCallStatus(CallStatus.FINISHED);
        } catch (err) {
            console.error("❌ Failed to stop call:", err);
        }
    };

    const latestMessage = messages[messages.length - 1]?.content;

    const isInactiveOrFinished =
        callStatus === CallStatus.INACTIVE ||
        callStatus === CallStatus.FINISHED;

    return (
        <>
            {/* 🔊 CALL VIEW */}
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak"></span>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="User"
                            width={540}
                            height={540}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {/* 💬 TRANSCRIPT */}
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={latestMessage}
                            className={cn(
                                'transition-opacity duration-500 opacity-0',
                                'animate-fadeIn opacity-100'
                            )}
                        >
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* ❌ ERROR */}
            {error && (
                <p className="text-red-500 text-center mt-4">
                    {error}
                </p>
            )}

            {/*  BUTTON */}
            <div className="w-full flex justify-center items-center mt-6">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className="relative btn-call"
                        onClick={handleCall}
                        disabled={callStatus === CallStatus.CONNECTING}
                    >
                        <span
                            className={cn(
                                'absolute animate-ping rounded-full opacity-75',
                                callStatus !== CallStatus.CONNECTING && 'hidden'
                            )}
                        ></span>

                        <span>
                            {isInactiveOrFinished
                                ? 'Start Interview'
                                : 'Connecting...'}
                        </span>
                    </button>
                ) : (
                    <button
                        className="btn-disconnect"
                        onClick={handleDisconnect}
                    >
                        End Call
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;