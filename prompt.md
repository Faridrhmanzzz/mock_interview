ubah di bagian database saya, tabel user, interview, feedback, dengan update yang terbaru

User
- userId (PrimaryKey)

Interview
- interviewId (PrimaryKey)
- interviewUserId (ForeignKey)

Feedback
- feedbackId (PrimaryKey)
- feedbackUserId (ForeignKey)
- feedbackInterviewId (ForeignKey)