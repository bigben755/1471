// Central content for 1471 Horwich Squadron RAF Air Cadets website.
import {
  Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy,
  TentTree, Shield, BookOpen, HeartHandshake, GraduationCap, Users,
  Globe2, FileText, BadgeCheck, Briefcase,
} from "lucide-react";

export const CREST_URL =
  "https://customer-assets.emergentagent.com/job_283d297f-7217-4e9a-b0b5-b0baa4b4d8bf/artifacts/nmvg3tzu_1471%20crest%20transparent.png";

export const SKY_HERO =
  "https://images.unsplash.com/photo-1561292668-2c02d228b17f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920";
export const CLOUDS_WIDE =
  "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920";

export const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Activities", to: "/activities" },
  { label: "Cadets", to: "/cadets" },
  { label: "Parents", to: "/parents" },
  { label: "Volunteer", to: "/volunteer" },
  { label: "FAQ", to: "/faq" },
  { label: "Join", to: "/join" },
];

export const HIGHLIGHTS = [
  { label: "Ages", value: "12\u201317", icon: Users },
  { label: "Parade nights", value: "Mon & Thu", icon: Compass },
  { label: "Focus", value: "Aviation & adventure", icon: Plane },
  { label: "Part of", value: "RAF Air Cadets", icon: Shield },
];

export const ABOUT_CARDS = [
  {
    title: "Aviation and STEM",
    icon: Plane,
    text: "Air power, aircraft, flying knowledge, navigation, aviation studies and technical interest.",
  },
  {
    title: "Adventure and Challenge",
    icon: Mountain,
    text: "Adventure training, camps, DofE, sport, fieldcraft and outdoor learning.",
  },
  {
    title: "Confidence and Leadership",
    icon: Compass,
    text: "Teamwork, communication, responsibility, drill, NCO development and public service.",
  },
];

export const ACTIVITIES = [
  { title: "Flying", icon: Plane, text: "Cadets may have opportunities to experience flying through RAF Air Cadets activities, subject to availability and eligibility." },
  { title: "Gliding", icon: Wind, text: "Cadets can work towards gliding experiences delivered in line with RAFAC procedures and programme planning." },
  { title: "Adventure Training", icon: Mountain, text: "Climbing, hill walking, kayaking and more, where available, supervised and weather-dependent." },
  { title: "Duke of Edinburgh\u2019s Award", icon: Award, text: "Cadets can work towards Bronze, Silver and Gold DofE awards through the squadron programme." },
  { title: "First Aid", icon: HeartPulse, text: "Cadets may work towards recognised first aid training and qualifications, subject to eligibility." },
  { title: "Leadership", icon: Compass, text: "Practical leadership tasks, teamwork challenges and NCO development opportunities." },
  { title: "Fieldcraft", icon: Tent, text: "Learn navigation, teamwork and outdoor skills through structured fieldcraft training." },
  { title: "Sport", icon: Trophy, text: "Take part in squadron, wing and corps sport, from athletics to team games." },
  { title: "Camps", icon: TentTree, text: "Cadets may attend camps and visits, including activities at RAF stations where available." },
  { title: "Drill and Uniform", icon: Shield, text: "Develop discipline, pride and bearing through drill and uniform standards." },
  { title: "Aviation Studies", icon: BookOpen, text: "Build knowledge of aircraft, navigation, air power and the principles of flight." },
  { title: "Community Events", icon: HeartHandshake, text: "Represent the squadron at parades, fundraising and local community events." },
];

export const CADET_BULLETS = [
  "Learn about aviation and aircraft.",
  "Take part in team challenges.",
  "Develop leadership and communication skills.",
  "Work towards awards and qualifications.",
  "Represent the squadron at events.",
  "Build confidence in a structured uniformed youth organisation.",
];

export const PARENT_CARDS = [
  { title: "Structured environment", icon: Shield, text: "Parade nights, uniform standards, training syllabus and progression." },
  { title: "Skills for the future", icon: GraduationCap, text: "Confidence, teamwork, communication, leadership, discipline and responsibility." },
  { title: "Wider opportunities", icon: Globe2, text: "DofE, first aid, aviation, camps, sport, leadership and community activities." },
  { title: "Safeguarding and supervision", icon: BadgeCheck, text: "Activities are delivered through RAFAC procedures, trained volunteers and appropriate supervision." },
];

export const VOLUNTEER_ROLES = [
  { title: "Civilian Instructor", icon: BookOpen, text: "Support cadet training and share knowledge without wearing uniform." },
  { title: "Uniformed Volunteer", icon: Shield, text: "Take on a uniformed role helping lead and deliver the cadet programme." },
  { title: "Squadron Support", icon: Users, text: "Assist with administration, organisation and the day-to-day running of the squadron." },
  { title: "Specialist Skills", icon: Briefcase, text: "Bring professional or technical skills, from first aid to STEM, IT and logistics." },
  { title: "Fundraising & Committee", icon: HeartHandshake, text: "Help with fundraising, events and committee support that keep the squadron thriving." },
];

export const VALUE_CARDS = [
  { title: "Leadership evidence", icon: Compass, text: "Real examples of leading teams and taking responsibility." },
  { title: "Teamwork examples", icon: Users, text: "Experience working towards shared goals under pressure." },
  { title: "DofE and volunteering", icon: Award, text: "Recognised awards and a record of giving back to the community." },
  { title: "First aid and responsibility", icon: HeartPulse, text: "Practical, life-relevant skills employers value." },
  { title: "Cadet CV and applications", icon: FileText, text: "Staff can generate a Cadet CV when a cadet is leaving or applying for work, college or university." },
  { title: "Recognised awards where available", icon: BadgeCheck, text: "BTEC and Institute of Leadership & Management awards through CV College, where applicable." },
];

export const JOIN_PATHWAYS = [
  { key: "Join as a Cadet", title: "Join as a Cadet", text: "For young people aged 12\u201317 interested in joining the squadron.", icon: Plane },
  { key: "Parent/Carer Enquiry", title: "Parent / Carer Enquiry", text: "For parents and carers who want more information before their child joins.", icon: Users },
  { key: "Adult Volunteer Enquiry", title: "Adult Volunteer Enquiry", text: "For adults who would like to help support the next generation.", icon: HeartHandshake },
];

export const ENQUIRY_TYPES = [
  "Join as a Cadet",
  "Parent/Carer Enquiry",
  "Adult Volunteer Enquiry",
  "General Enquiry",
];

export const FAQS = [
  { q: "What age can you join Air Cadets?", a: "Young people can join the Royal Air Force Air Cadets from around 12 years old (school year 8) and may continue as a cadet up to the age of 20, in line with national RAFAC policy. At 1471 Horwich Squadron we welcome enquiries from young people aged 12 to 17." },
  { q: "Do you need aviation experience to join?", a: "No. You do not need any military experience, aviation knowledge or previous qualifications. You just need a willingness to get involved, learn and take part." },
  { q: "What do RAF Air Cadets do?", a: "Cadets take part in a wide range of activities including aviation studies, leadership, adventure training, camps, sport, first aid, DofE, fieldcraft, drill and community events \u2014 subject to availability, eligibility and RAFAC procedures." },
  { q: "Is Air Cadets part of the RAF?", a: "The Royal Air Force Air Cadets is a youth organisation sponsored by the Royal Air Force. Taking part does not mean joining the Armed Forces \u2014 it is youth development with an aviation theme." },
  { q: "Do cadets get to fly?", a: "Cadets may have opportunities to experience flying and gliding through RAF Air Cadets activities. These opportunities are subject to availability, eligibility, weather and RAFAC procedures." },
  { q: "Can cadets do the Duke of Edinburgh\u2019s Award?", a: "Yes. Cadets can work towards Bronze, Silver and Gold Duke of Edinburgh\u2019s Award through the squadron programme, where available and appropriate." },
  { q: "What skills do cadets develop?", a: "Cadets develop confidence, leadership, teamwork, communication, discipline and responsibility, alongside practical skills such as first aid, navigation and aviation knowledge." },
  { q: "How often does the squadron meet?", a: "1471 Horwich Squadron parades on Monday and Thursday evenings, 19:00\u201321:30, at the Squadron Headquarters in Horwich. Additional activities and events may take place at other times." },
  { q: "What should parents know before their child joins?", a: "RAF Air Cadets provides a structured youth development environment with trained adult volunteers, clear policies and a supportive programme. Activities are delivered through RAFAC procedures, trained volunteers and appropriate supervision." },
  { q: "Can adults volunteer with 1471 Horwich Squadron?", a: "Yes. Adult volunteers are essential to the RAF Air Cadets. There are uniformed and non-uniformed roles, and new volunteers complete induction and training before taking on responsibilities." },
  { q: "Do adult volunteers need military experience?", a: "No. You do not need to have served in the Armed Forces or have aviation experience. Volunteers bring a wide range of skills and support cadet development, activities, administration and events." },
  { q: "How do I contact 1471 Horwich Squadron?", a: "You can use the enquiry form on this website, or reach us through our Facebook page. Our headquarters is at St Joseph\u2019s Secondary School & Sports College, Chorley New Road, Horwich, BL6 6HW." },
];

export const VENUE = {
  nights: "Monday & Thursday",
  time: "19:00 \u2013 21:30",
  name: "1471 (Horwich) ATC Sqn HQ",
  address: "St Joseph\u2019s Secondary School & Sports College, Chorley New Road, Horwich, BL6 6HW",
};

export const LINKS = {
  national: "https://www.raf.mod.uk/aircadets/",
  facebook: "https://www.facebook.com/1471HorwichRAFAC?locale=en_GB",
};
