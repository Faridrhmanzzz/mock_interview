'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'

interface FeedbackSliderProps {
    feedbackList: Feedback[]
    interview: Interview
    interviewId: string
}

const FeedbackSlider = ({ feedbackList, interview, interviewId }: FeedbackSliderProps) => {
    // Default: tampilkan attempt paling baru (index terakhir)
    const [activeIndex, setActiveIndex] = useState(feedbackList.length - 1)
    const feedback = feedbackList[activeIndex]

    const hasPrev = activeIndex > 0
    const hasNext = activeIndex < feedbackList.length - 1

    return (
        <section className="section-feedback">
            {/* Header */}
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview –{' '}
                    <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            {/* Attempt Tabs */}
            <div className="flex flex-row justify-center">
                <div className="flex flex-row gap-2 flex-wrap justify-center">
                    {feedbackList.map((fb, index) => (
                        <button
                            key={fb.feedbackId}
                            onClick={() => setActiveIndex(index)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 ${index === activeIndex
                                    ? 'bg-primary-200 text-dark-100'
                                    : 'bg-dark-200 text-primary-200 hover:bg-dark-200/80'
                                }`}
                        >
                            Take {fb.attemptNumber}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overall Score & Date */}
            <div className="flex flex-row justify-center">
                <div className="flex flex-row gap-5">
                    {/* Overall Impression */}
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p>
                            Overall Impression:{' '}
                            <span className="text-primary-200 font-bold">
                                {feedback?.totalScore}
                            </span>
                            /100
                        </p>
                    </div>

                    {/* Date */}
                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {feedback?.createdAt
                                ? dayjs(feedback.createdAt).format('MMM D, YYYY h:mm A')
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <hr />

            {/* Final Assessment */}
            <p>{feedback?.finalAssessment}</p>

            {/* Interview Breakdown */}
            <div className="flex flex-col gap-4">
                <h2>Breakdown of the Interview:</h2>
                {feedback?.categoryScores?.map((category, index) => (
                    <div key={index}>
                        <p className="font-bold">
                            {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>

            {/* Strengths */}
            <div className="flex flex-col gap-3">
                <h3>Strengths</h3>
                <ul>
                    {feedback?.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="flex flex-col gap-3">
                <h3>Areas for Improvement</h3>
                <ul>
                    {feedback?.areasForImprovement?.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>

            {/* Prev / Next Navigation */}
            <div className="flex flex-row justify-center gap-4">
                <Button
                    className="btn-secondary"
                    disabled={!hasPrev}
                    onClick={() => setActiveIndex((prev) => prev - 1)}
                >
                    <p className="text-sm font-semibold text-primary-200">← Sebelumnya</p>
                </Button>
                <Button
                    className="btn-secondary"
                    disabled={!hasNext}
                    onClick={() => setActiveIndex((prev) => prev + 1)}
                >
                    <p className="text-sm font-semibold text-primary-200">Berikutnya →</p>
                </Button>
            </div>

            {/* Back to Dashboard & Retake */}
            <div className="buttons">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>

                <Button className="btn-primary flex-1">
                    <Link
                        href={`/interview/${interviewId}`}
                        className="flex w-full justify-center"
                    >
                        <p className="text-sm font-semibold text-black text-center">
                            Retake Interview
                        </p>
                    </Link>
                </Button>
            </div>
        </section>
    )
}

export default FeedbackSlider
