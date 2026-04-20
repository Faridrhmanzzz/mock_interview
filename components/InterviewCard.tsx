import React from 'react'
import dayjs from 'dayjs';
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "@/components/DisplayTechIcons";

export const InterviewCard = ({
                                  interviewId,
                                  userId,
                                  role,
                                  type,
                                  techstack,
                                  createdAt
                              }: InterviewCardProps) => {

    const feedback = null as Feedback | null;

    // ✅ Normalize type
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;

    // ✅ Dynamic badge color
    const badgeColor =
        normalizedType === "Technical"
            ? "bg-blue-500"
            : normalizedType === "Mixed"
                ? "bg-purple-500"
                : "bg-gray-500";

    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format('MMM D, YYYY');

    return (
        <div className="card-border w-[360px] mac-sm-sm:w-full min-h-96">
            <div className="card-interview relative">

                {/* ✅ BADGE (FIXED SIZE + DYNAMIC COLOR) */}
                <div
                    className={`absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg ${badgeColor}`}
                >
                    <p className="badge-text text-white">{normalizedType}</p>
                </div>

                <div>
                    <Image
                        src={getRandomInterviewCover()}
                        alt="cover image"
                        width={90}
                        height={90}
                        className="rounded-full object-cover size-[90px]"
                    />

                    <h3 className="mt-5 capitalize">
                        {role} Interview
                    </h3>

                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2">
                            <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                            <p>{formattedDate}</p>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" alt="star" width={22} height={22} />
                            <p>{feedback?.totalScore || '---'}/100</p>
                        </div>
                    </div>

                    <p className="line-clamp-2 mt-5">
                        {feedback?.finalAssessment ||
                            "You haven't taken the interview yet. Take it now to improve your skills."}
                    </p>
                </div>

                <div className="flex flex-row justify-between mt-6">
                    <DisplayTechIcons techStack={techstack} />

                    <Button className="btn-primary">
                        <Link
                            href={
                                feedback
                                    ? `/interview/${interviewId}/feedback`
                                    : `/interview/${interviewId}`
                            }
                        >
                            {feedback ? 'Check Feedback' : 'View Interview'}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InterviewCard