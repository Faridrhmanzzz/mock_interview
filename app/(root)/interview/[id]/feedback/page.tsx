import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from "@/lib/actions/auth.action"
import { getAllFeedbackByInterviewId, getInterviewsById } from "@/lib/actions/general.action"
import FeedbackSlider from "@/components/FeedbackSlider"

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();

    const interview = await getInterviewsById(id);
    if (!interview) redirect('/');

    const feedbackList = await getAllFeedbackByInterviewId({
        interviewId: id,
        userId: user?.userId!
    });

    if (!feedbackList || feedbackList.length === 0) {
        return (
            <section className="section-feedback">
                <div className="flex flex-row justify-center">
                    <h1 className="text-4xl font-semibold">
                        Feedback on the Interview –{' '}
                        <span className="capitalize">{interview.role}</span> Interview
                    </h1>
                </div>
                <p className="text-center text-lg text-light-100">
                    Belum ada feedback untuk interview ini.
                </p>
            </section>
        );
    }

    return (
        <FeedbackSlider
            feedbackList={feedbackList}
            interview={interview}
            interviewId={id}
        />
    );
};
export default Page
