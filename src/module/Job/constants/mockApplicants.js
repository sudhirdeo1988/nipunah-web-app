import { APPLICATION_STATUS, getStatusLabel } from "./applicationStatuses";

/**
 * Build a stage history entry.
 */
export const createStageEntry = ({
  status,
  remarks = "",
  date = null,
  interview = null,
}) => ({
  id: `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  status,
  label: getStatusLabel(status),
  remarks: remarks || "",
  date: date || new Date().toISOString().slice(0, 10),
  interview: interview ? { ...interview } : null,
});

/**
 * Mock applicants keyed loosely by job id.
 * Used while applicants API is not available.
 */
const MOCK_APPLICANTS_POOL = [
  {
    id: "app-1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    appliedDate: "2026-07-20",
    status: APPLICATION_STATUS.APPLIED,
    experience: "5 years",
    skills: ["React", "Node.js", "TypeScript"],
    resumeUrl: "/resumes/john-smith.pdf",
    resumeName: "John_Smith_CV.pdf",
    coverLetter:
      "<p>I am excited to apply for this role. With 5 years of full-stack experience, I have delivered scalable React and Node.js products.</p><p>I would welcome the opportunity to discuss how I can contribute to your team.</p><p>I have shipped multiple B2B SaaS products and enjoy mentoring junior engineers.</p>",
    interview: null,
    remarks: "",
    stageHistory: [
      {
        id: "s1-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-20",
        interview: null,
      },
    ],
  },
  {
    id: "app-2",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0456",
    appliedDate: "2026-07-19",
    status: APPLICATION_STATUS.SHORTLISTED,
    experience: "4 years",
    skills: ["React", "JavaScript", "CSS"],
    resumeUrl: "/resumes/sarah-johnson.pdf",
    resumeName: "Sarah_Johnson_Resume.pdf",
    coverLetter:
      "<p>Please find my application for the Frontend Developer position. I specialize in accessible, performant UI.</p>",
    interview: null,
    remarks: "Strong portfolio — shortlisted for next round.",
    stageHistory: [
      {
        id: "s2-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-19",
        interview: null,
      },
      {
        id: "s2-2",
        status: APPLICATION_STATUS.UNDER_REVIEW,
        label: "Under Review",
        remarks: "Profile matches core frontend requirements.",
        date: "2026-07-20",
        interview: null,
      },
      {
        id: "s2-3",
        status: APPLICATION_STATUS.SHORTLISTED,
        label: "Shortlisted",
        remarks: "Strong portfolio — shortlisted for next round.",
        date: "2026-07-21",
        interview: null,
      },
    ],
  },
  {
    id: "app-3",
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1-555-0789",
    appliedDate: "2026-07-18",
    status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
    experience: "6 years",
    skills: ["React", "Node.js", "AWS", "Docker"],
    resumeUrl: "/resumes/mike-wilson.pdf",
    resumeName: "Mike_Wilson_CV.pdf",
    coverLetter:
      "<p>I bring deep experience in cloud-native React/Node stacks and would love to interview for this opening.</p>",
    interview: {
      date: "2026-08-05",
      time: "11:00",
      mode: "video",
      location: "",
      meetingLink: "https://meet.example.com/mike-wilson",
    },
    remarks: "Scheduled technical round with hiring manager.",
    stageHistory: [
      {
        id: "s3-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-18",
        interview: null,
      },
      {
        id: "s3-2",
        status: APPLICATION_STATUS.SHORTLISTED,
        label: "Shortlisted",
        remarks: "Strong AWS + React background.",
        date: "2026-07-22",
        interview: null,
      },
      {
        id: "s3-3",
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        label: "Interview Scheduled",
        remarks: "Scheduled technical round with hiring manager.",
        date: "2026-07-24",
        interview: {
          date: "2026-08-05",
          time: "11:00",
          mode: "video",
          location: "",
          meetingLink: "https://meet.example.com/mike-wilson",
        },
      },
    ],
  },
  {
    id: "app-4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1-555-0321",
    appliedDate: "2026-07-17",
    status: APPLICATION_STATUS.REJECTED,
    experience: "2 years",
    skills: ["React", "JavaScript"],
    resumeUrl: "/resumes/emily-davis.pdf",
    resumeName: "Emily_Davis_CV.pdf",
    coverLetter:
      "<p>I am applying as an early-career React developer eager to grow with your team.</p>",
    interview: null,
    remarks: "Experience below the required range for this role.",
    stageHistory: [
      {
        id: "s4-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-17",
        interview: null,
      },
      {
        id: "s4-2",
        status: APPLICATION_STATUS.UNDER_REVIEW,
        label: "Under Review",
        remarks: "Reviewed resume and cover letter.",
        date: "2026-07-18",
        interview: null,
      },
      {
        id: "s4-3",
        status: APPLICATION_STATUS.REJECTED,
        label: "Rejected",
        remarks: "Experience below the required range for this role.",
        date: "2026-07-19",
        interview: null,
      },
    ],
  },
  {
    id: "app-5",
    name: "David Brown",
    email: "david.brown@email.com",
    phone: "+1-555-0654",
    appliedDate: "2026-07-16",
    status: APPLICATION_STATUS.SELECTED,
    experience: "7 years",
    skills: ["React", "Node.js", "TypeScript", "GraphQL"],
    resumeUrl: "/resumes/david-brown.pdf",
    resumeName: "David_Brown_Resume.pdf",
    coverLetter:
      "<p>Thank you for considering my application. I have led multiple GraphQL/React platforms end to end.</p><p>Looking forward to contributing to your product roadmap.</p>",
    interview: {
      date: "2026-07-28",
      time: "15:30",
      mode: "in_person",
      location: "Office Floor 3, Conference Room B",
      meetingLink: "",
    },
    remarks: "Excellent interview — offer approved.",
    stageHistory: [
      {
        id: "s5-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-16",
        interview: null,
      },
      {
        id: "s5-2",
        status: APPLICATION_STATUS.SHORTLISTED,
        label: "Shortlisted",
        remarks: "Top match for GraphQL + React stack.",
        date: "2026-07-18",
        interview: null,
      },
      {
        id: "s5-3",
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        label: "Interview Scheduled",
        remarks: "Onsite panel interview booked.",
        date: "2026-07-20",
        interview: {
          date: "2026-07-28",
          time: "15:30",
          mode: "in_person",
          location: "Office Floor 3, Conference Room B",
          meetingLink: "",
        },
      },
      {
        id: "s5-4",
        status: APPLICATION_STATUS.SELECTED,
        label: "Selected",
        remarks: "Excellent interview — offer approved.",
        date: "2026-07-29",
        interview: {
          date: "2026-07-28",
          time: "15:30",
          mode: "in_person",
          location: "Office Floor 3, Conference Room B",
          meetingLink: "",
        },
      },
    ],
  },
  {
    id: "app-6",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91-98765-43210",
    appliedDate: "2026-07-22",
    status: APPLICATION_STATUS.UNDER_REVIEW,
    experience: "5 years",
    skills: ["Java", "Spring Boot", "Kafka"],
    resumeUrl: "/resumes/priya-sharma.pdf",
    resumeName: "Priya_Sharma_CV.pdf",
    coverLetter:
      "<p>I am interested in this backend-heavy role and have shipped high-throughput Java services.</p>",
    interview: null,
    remarks: "Checking team fit for Kafka workload.",
    stageHistory: [
      {
        id: "s6-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-22",
        interview: null,
      },
      {
        id: "s6-2",
        status: APPLICATION_STATUS.UNDER_REVIEW,
        label: "Under Review",
        remarks: "Checking team fit for Kafka workload.",
        date: "2026-07-23",
        interview: null,
      },
    ],
  },
  {
    id: "app-7",
    name: "Alex Chen",
    email: "alex.chen@email.com",
    phone: "+1-555-0987",
    appliedDate: "2026-07-21",
    status: APPLICATION_STATUS.APPLIED,
    experience: "3 years",
    skills: ["Python", "Django", "PostgreSQL"],
    resumeUrl: "/resumes/alex-chen.pdf",
    resumeName: "Alex_Chen_CV.pdf",
    coverLetter:
      "<p>My background in Django APIs and data pipelines aligns well with this position.</p>",
    interview: null,
    remarks: "",
    stageHistory: [
      {
        id: "s7-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-21",
        interview: null,
      },
    ],
  },
  {
    id: "app-8",
    name: "Fatima Rahman",
    email: "fatima.rahman@email.com",
    phone: "+971-50-123-4567",
    appliedDate: "2026-07-15",
    status: APPLICATION_STATUS.SHORTLISTED,
    experience: "8 years",
    skills: ["Product", "Agile", "Stakeholder Mgmt"],
    resumeUrl: "/resumes/fatima-rahman.pdf",
    resumeName: "Fatima_Rahman_CV.pdf",
    coverLetter:
      "<p>I have led cross-functional delivery for enterprise products and am keen to join your team.</p>",
    interview: null,
    remarks: "Strong stakeholder management experience.",
    stageHistory: [
      {
        id: "s8-1",
        status: APPLICATION_STATUS.APPLIED,
        label: "Applied",
        remarks: "Application received.",
        date: "2026-07-15",
        interview: null,
      },
      {
        id: "s8-2",
        status: APPLICATION_STATUS.SHORTLISTED,
        label: "Shortlisted",
        remarks: "Strong stakeholder management experience.",
        date: "2026-07-17",
        interview: null,
      },
    ],
  },
];

/** Assign a stable subset of applicants per job id */
const getSeedIndexesForJob = (jobId) => {
  const n = Number(jobId) || 0;
  const start = n % 4;
  const count = 4 + (n % 3); // 4–6 applicants
  const indexes = [];
  for (let i = 0; i < count; i += 1) {
    indexes.push((start + i) % MOCK_APPLICANTS_POOL.length);
  }
  return indexes;
};

/**
 * Build mock applicants for a job. Clones pool items with job-scoped ids.
 */
export const buildMockApplicantsForJob = (jobId) => {
  const idStr = String(jobId || "0");
  return getSeedIndexesForJob(idStr).map((poolIndex) => {
    const base = MOCK_APPLICANTS_POOL[poolIndex];
    return {
      ...base,
      id: `${idStr}-${base.id}`,
      jobId: idStr,
      interview: base.interview ? { ...base.interview } : null,
      skills: [...(base.skills || [])],
      stageHistory: (base.stageHistory || []).map((s) => ({
        ...s,
        interview: s.interview ? { ...s.interview } : null,
      })),
      appliedDate: base.appliedDate,
    };
  });
};

export const buildMockGetApplicantsResponse = (jobId) => ({
  success: true,
  data: buildMockApplicantsForJob(jobId),
});
