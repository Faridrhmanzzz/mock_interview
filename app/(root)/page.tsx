import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/actions/general.action";

const Page = async () => {
    const user = await getCurrentUser();

    const userInterviews = await getInterviewsByUserId(user?.id!);

    const interviewsWithFeedback = await Promise.all(
        (userInterviews || []).map(async (interview) => {
            const feedback = await getFeedbackByInterviewId({
                interviewId: interview.id,
                userId: user?.id!
            });
            return { ...interview, hasFeedback: !!feedback };
        })
    );

    const completedInterviews = interviewsWithFeedback.filter((i) => i.hasFeedback);
    const pendingInterviews = interviewsWithFeedback.filter((i) => !i.hasFeedback);

    return (
        <div>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with AI Practice and Feedback</h2>
                    <p className="text-lg">
                        Practice on real interview questions and get instant feedback
                    </p>
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                <Image
                    src="/robot.png"
                    alt="robo-dude"
                    width={400}
                    height={400}
                    className="max-sm:hidden"
                />
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                <div className="interviews-section">
                    {completedInterviews.length > 0 ? (
                        completedInterviews.map((interview) => (
                            <InterviewCard
                                {...interview}
                                userId={user?.id}
                                key={interview.id}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground">
                            You haven&apos;t taken any interviews yet
                        </p>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>
                <div className="interviews-section">
                    {pendingInterviews.length > 0 ? (
                        pendingInterviews.map((interview) => (
                            <InterviewCard
                                {...interview}
                                userId={user?.id}
                                key={interview.id}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground">
                            There are no new interviews available
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Page;