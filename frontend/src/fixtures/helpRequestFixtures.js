const helpRequestFixtures = {
  oneHelpRequest: {
    id: 2,
    requesterEmail: "kelvinfang@ucsb.edu",
    teamId: "s22-5pm-3",
    tableOrBreakoutRoom: "15",
    requestTime: "2022-04-20T17:35:00",
    explanation: "need help with CRUD task",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 2,
      requesterEmail: "kelvinfang@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "15",
      requestTime: "2022-04-20T17:35:00",
      explanation: "need help with CRUD task",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "ldelplaya@ucsb.edu",
      teamId: "s22-6pm-3",
      tableOrBreakoutRoom: "12",
      requestTime: "2022-04-20T18:31:00",
      explanation: "need help with frontend task",
      solved: true,
    },
    {
      id: 4,
      requesterEmail: "pdg@ucsb.edu",
      teamId: "s22-6pm-4",
      tableOrBreakoutRoom: "10",
      requestTime: "2022-04-21T14:15:00",
      explanation: "need help with JPA04",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
