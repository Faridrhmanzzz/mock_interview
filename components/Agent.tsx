'use client';
import React, {useEffect, useState} from 'react'
import Image from 'next/image';
import { cn } from "@/lib/utils";
import {useRouter} from "next/navigation";
import { vapi } from '@/lib/vapi.sdk';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage{
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const Agent = ({ userName, userId, type } : any) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]); // Perbaikan: samakan nama dengan render di bawah

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: any) => {
            if(message.type === 'transcript' && message.transcriptType === 'final'){
                const newMessage: SavedMessage = { role: message.role, content: message.transcript }

                setMessages((prev) => [ ... prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => console.log('Error', error); // Perbaikan: perbaiki syntax arrow function

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => { // Perbaikan: perbaiki syntax arrow function
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    }, [])

    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) router.push('/');
    }, [messages, callStatus, type, userId, router]); // Perbaikan: tambahkan router ke dependency

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
            variableValues:{
                username: userName,
                userid: userId,
            }
        })
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    const latestMessage = messages[messages.length - 1]?.content; // Perbaikan: gunakan 'messages' bukan 'message'
    const isCallIncativeOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="vapi"
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
                            alt="user avatar"
                            width={540}
                            height={540}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {messages.length > 0 && ( // Perbaikan: gunakan 'messages'
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center items-center mt-6">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>

                        <span
                            className={cn(
                                'absolute animate-ping rounded-full opacity-75',
                                callStatus !== CallStatus.CONNECTING && 'hidden'
                            )}
                        ></span>

                        <span>
                            {isCallIncativeOrFinished
                                ? 'Call'
                                : '...'}
                        </span>

                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        END
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent;