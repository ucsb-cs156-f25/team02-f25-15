const recommendationRequestFixtures = {
    oneRequest: {
        id: 1,
        requesterEmail: "student@ucsb.edu",
        professorEmail: "professor@ucsb.edu",
        explanation: "Grad School Recommendation",
        dateRequested: "2022-01-02T12:00:00",
        dateNeeded: "2022-05-01T12:00:00",
        done: false
    },
    threeRequests: [
        {
            id: 1,
            requesterEmail: "student1@ucsb.edu",
            professorEmail: "professor1@ucsb.edu",
            explanation: "Grad School Recommendation",
            dateRequested: "2022-01-02T12:00:00",
            dateNeeded: "2022-05-01T12:00:00",
            done: false
        },
        {
            id: 2,
            requesterEmail: "student2@ucsb.edu",
            professorEmail: "professor2@ucsb.edu",
            explanation: "Job Recommendation",
            dateRequested: "2022-02-15T12:00:00",
            dateNeeded: "2022-06-15T12:00:00",
            done: true
        },
        {
            id: 3,
            requesterEmail: "student3@ucsb.edu",
            professorEmail: "professor3@ucsb.edu",
            explanation: "Job Recommendation",
            dateRequested: "2022-03-20T12:00:00",
            dateNeeded: "2022-07-20T12:00:00",
            done: false
        }
    ]
};

export { recommendationRequestFixtures };