/** Employment type options for work experience */
export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "self_employed", label: "Self-employed" },
];

/** Default form initial values */
export const INITIAL_VALUES = {
  workExperience: [
    {
      jobTitle: "",
      employmentType: undefined,
      company: "",
      companyWorkDuration: "",
    },
  ],
  skills: [""],
  education: [
    {
      title: "",
      schoolCollege: "",
      timePeriod: "",
      description: "",
    },
  ],
};
