/**
 * The crew.
 *
 * `photo` is optional — without it the constellation renders a monogram node.
 * Add a path under /public and that node becomes a portrait.
 */

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  /** Short line shown in the HUD readout. */
  bio: string;
  photo?: string;
  links?: { label: string; href: string }[];
};

export const departments = [
  "Core",
  "Technical",
  "Design",
  "Marketing",
  "Operations",
  "Web",
];

export const crew: CrewMember[] = [
  { id: "c1", name: "Ananya Mohapatra", role: "Festival Convenor", department: "Core", bio: "Fourth year, Metallurgical. Runs the flight plan and answers for it." },
  { id: "c2", name: "Rohit Panigrahi", role: "Deputy Convenor", department: "Core", bio: "Fourth year, Mechanical. Owns the arena builds and the safety brief." },
  { id: "c3", name: "Ishita Rane", role: "Head of Technical", department: "Technical", bio: "Third year, Electrical. Twelve brackets, one scoring system." },
  { id: "c4", name: "Karthik Iyer", role: "Robotics Lead", department: "Technical", bio: "Third year, Mechanical. Has rebuilt the Robowars arena twice." },
  { id: "c5", name: "Meera Das", role: "Head of Design", department: "Design", bio: "Third year, Architecture. Drew the planet you scrolled past." },
  { id: "c6", name: "Aditya Verma", role: "Motion & Identity", department: "Design", bio: "Second year, Computer Science. Keeps the frame rate honest." },
  { id: "c7", name: "Sneha Kulkarni", role: "Head of Marketing", department: "Marketing", bio: "Third year, Industrial Design. Turned last year's reach into this year's roster." },
  { id: "c8", name: "Farhan Qureshi", role: "Sponsorship Lead", department: "Marketing", bio: "Fourth year, Chemical. Closed the title partnership in March." },
  { id: "c9", name: "Priya Nair", role: "Head of Operations", department: "Operations", bio: "Third year, Civil. Beds, buses and forty-eight volunteer shifts." },
  { id: "c10", name: "Devansh Gupta", role: "Hospitality Lead", department: "Operations", bio: "Second year, Biotechnology. Nine hundred guests, zero missed check-ins." },
  { id: "c11", name: "Tanvi Sharma", role: "Web Lead", department: "Web", bio: "Third year, Computer Science. Built the registration pipeline you are about to use." },
  { id: "c12", name: "Arjun Bose", role: "Frontend Engineer", department: "Web", bio: "Second year, Electronics. Responsible for every orbit on this site." },
];
