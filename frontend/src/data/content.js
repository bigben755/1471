// Central content for 1471 Horwich Squadron RAF Air Cadets website.
import {
  Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy,
  TentTree, Shield, BookOpen, HeartHandshake, GraduationCap, Users,
  Globe2, FileText, BadgeCheck, Briefcase,
} from "lucide-react";

export const CREST_URL =
  "https://customer-assets.emergentagent.com/job_283d297f-7217-4e9a-b0b5-b0baa4b4d8bf/artifacts/nmvg3tzu_1471%20crest%20transparent.png";

// Squadron photographs (served locally from /public/squadron)
const IMG = (f) => `/squadron/${f}`;

export const SKY_HERO = IMG("flying/flying-up-in-the-sky.jpg");
export const CLOUDS_WIDE = IMG("flying/flying-cadets-on-the-flightline.jpg");
export const ABOUT_IMG = IMG("parade-evening-awards-night.jpg");
export const PARENTS_IMG = IMG("awards/presentation-evening-1.jpg");

export const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Activities", to: "/activities" },
  { label: "Cadets", to: "/cadets" },
  { label: "Parents", to: "/parents" },
  { label: "Volunteer", to: "/volunteer" },
  { label: "FAQ", to: "/faq" },
  { label: "News", to: "/news" },
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
  {
    slug: "flying", title: "Flying", icon: Plane,
    image: IMG("flying/flying-cadets-ready-for-flight.jpg"),
    gallery: [
      { src: IMG("flying/flying-cadet-being-fitted-with-kit.jpg"), caption: "Being fitted with flying kit" },
      { src: IMG("flying/flying-getting-in-the-aircraft.jpg"), caption: "Getting into the aircraft" },
      { src: IMG("flying/flying-cadet-in-cockpit.jpg"), caption: "In the cockpit" },
      { src: IMG("flying/flying-cadet-in-cockpit-2.jpg"), caption: "Ready at the controls" },
      { src: IMG("flying/flying-happy-in-the-cockpit.jpg"), caption: "All smiles before take-off" },
      { src: IMG("flying/flying-ready-for-take-off.jpg"), caption: "Ready for take-off" },
      { src: IMG("flying/flying-view-from-the-cockpit.jpg"), caption: "The view from the cockpit" },
      { src: IMG("flying/flying-up-in-the-sky.jpg"), caption: "Up in the sky" },
      { src: IMG("flying/flying-cadets-on-the-flightline.jpg"), caption: "Cadets on the flightline" },
      { src: IMG("flying/flying-cadets-walk-to-the-flightline.jpg"), caption: "Walking out to the flightline" },
      { src: IMG("awards/flying-award-1.jpg"), caption: "Flying award" },
      { src: IMG("awards/flying-award-2.jpg"), caption: "Celebrating a flying achievement" },
    ],
    text: "Cadets may have opportunities to experience flying through RAF Air Cadets activities, subject to availability and eligibility.",
    long: [
      "Flying is one of the most exciting parts of being an Air Cadet. Through RAF Air Cadets activities, cadets may have opportunities to take to the air and experience powered flight first-hand, building a real understanding of aviation.",
      "Flying opportunities are arranged through RAFAC and depend on availability, eligibility, weather and procedures, so they are not guaranteed for every cadet at every stage \u2014 but they are a genuine goal to aim for.",
    ],
    highlights: [
      "Experience powered flight where opportunities are available",
      "Learn the basic principles of flight and airmanship",
      "Understand the role of aircraft and air power",
      "Work towards aviation-themed badges and progression",
    ],
  },
  {
    slug: "gliding", title: "Gliding", icon: Wind,
    image: IMG("gliding/gliding-cadet-in-glider.jpg"),
    gallery: [
      { src: IMG("gliding/gliding-cadet-in-glider.jpg"), caption: "A cadet in the glider" },
      { src: IMG("gliding/gliding-cadets-helping.jpg"), caption: "Cadets helping on the airfield" },
      { src: IMG("gliding/20230617_102323.jpg"), caption: "Preparing for gliding" },
      { src: IMG("gliding/20230617_141944.jpg"), caption: "Gliding day on the airfield" },
    ],
    text: "Cadets can work towards gliding experiences delivered in line with RAFAC procedures and programme planning.",
    long: [
      "Gliding gives cadets the chance to experience flight in a glider and learn how aircraft use the air to stay aloft.",
      "Like flying, gliding is delivered through RAFAC and is subject to availability, eligibility, weather and safety procedures.",
    ],
    highlights: [
      "Experience gliding where opportunities are available",
      "Learn how gliders generate lift and stay airborne",
      "Build confidence and situational awareness",
      "Progress through aviation training where eligible",
    ],
  },
  {
    slug: "adventure-training", title: "Adventure Training", icon: Mountain,
    image: IMG("overseas-1-group-photo.jpg"),
    gallery: [
      { src: IMG("overseas-1.jpg"), caption: "Adventure overseas" },
      { src: IMG("overseas-1-group-photo.jpg"), caption: "The team on an overseas trip" },
      { src: IMG("overseas/20260526_131607.jpg"), caption: "Adventure training overseas" },
      { src: IMG("overseas/20260526_141606.jpg"), caption: "Outdoor challenge activity" },
      { src: IMG("overseas/20260526_174730.jpg"), caption: "Teamwork in action" },
      { src: IMG("overseas/20260527_145947(0).jpg"), caption: "Cadets exploring overseas" },
    ],
    text: "Climbing, hill walking, kayaking and more, where available, supervised and weather-dependent.",
    long: [
      "Adventure training takes cadets into the outdoors to take on new challenges \u2014 from hill walking and climbing to paddle sports and more.",
      "Activities are weather-dependent and delivered by qualified staff in line with RAFAC safety procedures, with appropriate supervision.",
    ],
    highlights: [
      "Try activities such as hill walking, climbing and kayaking",
      "Develop teamwork, resilience and self-confidence",
      "Learn to plan, prepare and stay safe outdoors",
      "Take part where activities are available and supervised",
    ],
  },
  {
    slug: "dofe", title: "Duke of Edinburgh\u2019s Award", icon: Award,
    text: "Cadets can work towards Bronze, Silver and Gold DofE awards through the squadron programme.",
    long: [
      "The Duke of Edinburgh\u2019s Award is a respected programme recognised by employers, colleges and universities. Cadets can work towards Bronze, Silver and Gold levels.",
      "Each level involves volunteering, physical activity, developing a skill and an expedition, delivered alongside the wider cadet programme.",
    ],
    highlights: [
      "Work towards Bronze, Silver and Gold awards",
      "Develop a new skill and improve physical fitness",
      "Take part in expeditions and volunteering",
      "Gain an award recognised on CVs and applications",
    ],
  },
  {
    slug: "first-aid", title: "First Aid", icon: HeartPulse,
    text: "Cadets may work towards recognised first aid training and qualifications, subject to eligibility.",
    long: [
      "First aid is a practical, life-relevant skill. Cadets may work towards recognised first aid training, learning how to help in an emergency.",
      "Training is delivered in line with RAFAC and is subject to eligibility and availability.",
    ],
    highlights: [
      "Learn essential first aid and emergency response",
      "Build confidence to act calmly under pressure",
      "Work towards recognised first aid qualifications",
      "Develop responsibility and care for others",
    ],
  },
  {
    slug: "leadership", title: "Leadership", icon: Compass,
    image: IMG("awards/presentation-evening-2.jpg"),
    gallery: [
      { src: IMG("awards/presentation-evening-1.jpg"), caption: "Presentation evening" },
      { src: IMG("awards/presentation-evening-2.jpg"), caption: "Recognising achievement" },
      { src: IMG("awards/presentation-evening-3.jpg"), caption: "Awards and progression" },
      { src: IMG("parade-evening-awards-night.jpg"), caption: "Awards night on parade" },
    ],
    text: "Practical leadership tasks, teamwork challenges and NCO development opportunities.",
    long: [
      "Leadership runs through everything cadets do. Through practical tasks and team challenges, cadets learn to plan, communicate, delegate and lead.",
      "As they progress, cadets may take on responsibility as non-commissioned officers (NCOs), developing skills valued well beyond the squadron.",
    ],
    highlights: [
      "Take part in practical leadership tasks and challenges",
      "Develop communication and decision-making skills",
      "Work towards NCO responsibility as you progress",
      "Build experience to talk about in interviews",
    ],
  },
  {
    slug: "fieldcraft", title: "Fieldcraft", icon: Tent,
    image: IMG("fieldcraft/20260721_083302 (1).jpg"),
    gallery: [
      { src: IMG("fieldcraft/20260720_190743.jpg"), caption: "Fieldcraft training" },
      { src: IMG("fieldcraft/20260720_234038.jpg"), caption: "Night exercise" },
      { src: IMG("fieldcraft/20260721_083302 (1).jpg"), caption: "Morning in the field" },
      { src: IMG("fieldcraft/20260721_102342.jpg"), caption: "Working as a team" },
      { src: IMG("fieldcraft/20260721_201242.jpg"), caption: "Practical field skills" },
      { src: IMG("fieldcraft/20260721_210758.jpg"), caption: "Evening fieldcraft session" },
    ],
    text: "Learn navigation, teamwork and outdoor skills through structured fieldcraft training.",
    long: [
      "Fieldcraft teaches cadets how to work effectively as a team in the outdoors, covering navigation, communication and practical field skills.",
      "Sessions are structured and supervised, building confidence and teamwork step by step.",
    ],
    highlights: [
      "Learn navigation and map-reading",
      "Develop teamwork and communication in the field",
      "Build practical outdoor skills",
      "Take part in structured, supervised exercises",
    ],
  },
  {
    slug: "sport", title: "Sport", icon: Trophy,
    image: IMG("fun-go-karting-team-photo.jpg"),
    gallery: [
      { src: IMG("fun-go-karting-brief.jpg"), caption: "The safety brief" },
      { src: IMG("fun-go-karting-ready-to-go.jpg"), caption: "Ready to go" },
      { src: IMG("fun-go-karting-in-the-pits.jpg"), caption: "In the pits" },
      { src: IMG("fun-go-karting-team-photo.jpg"), caption: "The go-karting team" },
    ],
    text: "Take part in squadron, wing and corps sport, from athletics to team games.",
    long: [
      "Sport is a big part of cadet life, with opportunities to take part at squadron, wing and corps level across a range of activities.",
      "From athletics to team games, sport builds fitness, teamwork and a healthy sense of competition.",
    ],
    highlights: [
      "Take part in a range of individual and team sports",
      "Represent the squadron at wing and corps level",
      "Improve fitness, teamwork and resilience",
      "Try new sports in a supportive environment",
    ],
  },
  {
    slug: "camps", title: "Camps", icon: TentTree,
    image: IMG("raf_station_visits/raf-station-visit-bbmf-group-photo.jpg"),
    gallery: [
      { src: IMG("raf_station_visits/raf-station-visit-bbmf-group-photo.jpg"), caption: "Group photo at a station visit" },
      { src: IMG("raf_station_visits/20240221_131627.jpg"), caption: "Cadets on station visit" },
      { src: IMG("raf_station_visits/raf-station-visit-1-cadet-in-a-typhoon-raf-coningsby.jpg"), caption: "A cadet in a Typhoon, RAF Coningsby" },
      { src: IMG("raf_station_visits/raf-station-visit-1-raf-typhoon.jpg"), caption: "Up close with an RAF Typhoon" },
      { src: IMG("raf_station_visits/raf-station-visit-1-tour-round-a-typhoon-by-raf-pilot.jpg"), caption: "A tour of the Typhoon with an RAF pilot" },
      { src: IMG("raf_station_visits/raf-station-visit-2-bbmf-spitfire.jpg"), caption: "BBMF Spitfire" },
      { src: IMG("raf_station_visits/raf-station-visit-2-bbmf-lancaster.jpg"), caption: "BBMF Lancaster" },
      { src: IMG("air_shows/cosford airshow 4 - access all areas.jpg"), caption: "Air show access-all-areas experience" },
      { src: IMG("air_shows/riat (4).JPG"), caption: "Cadets at RIAT" },
    ],
    text: "Cadets may attend camps and visits, including activities at RAF stations where available.",
    long: [
      "Camps and visits are some of the most memorable experiences cadets can have, including activities and stays at RAF stations where available.",
      "Places are subject to availability, eligibility and RAFAC procedures.",
    ],
    highlights: [
      "Attend camps and visits where available",
      "Experience life and activities at RAF stations",
      "Make friends and memories beyond the squadron",
      "Take on new challenges away from home",
    ],
  },
  {
    slug: "drill-and-uniform", title: "Drill and Uniform", icon: Shield,
    image: IMG("parade-1-confirmation-of-the-king-1.jpg"),
    gallery: [
      { src: IMG("parade-1-confirmation-of-the-king-1.jpg"), caption: "On parade" },
      { src: IMG("parade-1-confirmation-of-the-king-2.jpg"), caption: "Ceremonial bearing" },
      { src: IMG("parades/rememberance-sunday-parade-1.jpg"), caption: "Remembrance Sunday parade" },
      { src: IMG("parades/rememberance-sunday-parade-2.jpg"), caption: "Marching with pride" },
      { src: IMG("parades/rememberance-parade-1.jpg"), caption: "Remembrance parade" },
      { src: IMG("parades/drill training.jpg"), caption: "Drill training" },
      { src: IMG("parades/drill training 2.jpg"), caption: "Drill practice" },
      { src: IMG("parades/drill training 3.jpg"), caption: "Precision and teamwork" },
      { src: IMG("parades/20220911_122531.jpg"), caption: "Parade day" },
    ],
    text: "Develop discipline, pride and bearing through drill and uniform standards.",
    long: [
      "Drill and uniform are part of the heritage and discipline of the Air Cadets. Cadets learn to take pride in their appearance and bearing.",
      "Drill develops coordination, attention to detail and teamwork, and features at parades and ceremonial events.",
    ],
    highlights: [
      "Learn drill and develop precision and discipline",
      "Take pride in uniform standards and bearing",
      "Represent the squadron at parades and events",
      "Build self-discipline and attention to detail",
    ],
  },
  {
    slug: "aviation-studies", title: "Aviation Studies", icon: BookOpen,
    image: IMG("flight_sim/flight-sim-1.jpg"),
    gallery: [
      { src: IMG("flight_sim/flight-sim-1.jpg"), caption: "On the flight simulator" },
      { src: IMG("flight_sim/flight-sim-2.jpg"), caption: "Learning the controls" },
      { src: IMG("flight_sim/flight-sim-3.jpg"), caption: "Putting theory into practice" },
      { src: IMG("careeers-days/careers-day-at-mbda.jpg"), caption: "Careers day at MBDA" },
      { src: IMG("classification_training/training - propulsion.jpg"), caption: "Classification training: propulsion" },
      { src: IMG("classification_training/training - propulsion 2.jpg"), caption: "Classification lesson" },
      { src: IMG("classification_training/20250607_120541.jpg"), caption: "Classroom instruction" },
      { src: IMG("stem/20260510_114429.jpg"), caption: "STEM activity" },
      { src: IMG("stem/20260510_135743.jpg"), caption: "Hands-on STEM learning" },
      { src: IMG("air_shows/cosford (1).jpg"), caption: "Aviation learning at an air show" },
      { src: IMG("air_shows/riat (2).JPG"), caption: "Aircraft and air power insight" },
    ],
    text: "Build knowledge of aircraft, navigation, air power and the principles of flight.",
    long: [
      "Aviation studies build cadets\u2019 knowledge of aircraft, navigation, air power and the principles of flight.",
      "This underpins many other activities and supports progression through the cadet training syllabus.",
    ],
    highlights: [
      "Learn the principles of flight and airmanship",
      "Build knowledge of aircraft and air power",
      "Develop navigation and aviation theory",
      "Progress through the cadet training syllabus",
    ],
  },
  {
    slug: "community-events", title: "Community Events", icon: HeartHandshake,
    image: IMG("poppy-appeal-collecting.jpg"),
    gallery: [
      { src: IMG("poppy-appeal-collecting.jpg"), caption: "Collecting for the Poppy Appeal" },
      { src: IMG("poppy-appeal-collecting-2.jpg"), caption: "Supporting the Poppy Appeal" },
      { src: IMG("poppy-appeal-1.jpg"), caption: "Poppy Appeal" },
      { src: IMG("fundraising/20241102_124752.jpg"), caption: "Community fundraising" },
      { src: IMG("fundraising/20251101_092450.jpg"), caption: "Cadets supporting a local appeal" },
      { src: IMG("fundraising/20251101_131631.jpg"), caption: "Fundraising in the community" },
      { src: IMG("fundraising/poppy appeal collecting.jpg"), caption: "Poppy Appeal collection" },
      { src: IMG("rememberance-concert-bolton-1.jpg"), caption: "Remembrance concert, Bolton" },
      { src: IMG("rememberance-concert-2.jpg"), caption: "Remembrance concert" },
      { src: IMG("rememberance-concert-3.jpg"), caption: "Honouring those who served" },
      { src: IMG("parades/FB_IMG_1762722018807.jpg"), caption: "Representing the squadron at a parade" },
      { src: IMG("parades/rememberance sunday parade 3.jpg"), caption: "Remembrance parade attendance" },
    ],
    text: "Represent the squadron at parades, fundraising and local community events.",
    long: [
      "Cadets represent 1471 Horwich Squadron at parades, fundraising and local community events, giving back to the area and developing pride.",
      "Taking part builds confidence, teamwork and a strong sense of belonging.",
    ],
    highlights: [
      "Represent the squadron at local events",
      "Support parades and ceremonial occasions",
      "Take part in fundraising and community work",
      "Develop pride, confidence and belonging",
    ],
  },
];

export const getActivity = (slug) => ACTIVITIES.find((a) => a.slug === slug);

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

export const AGE_BANDS = [
  { value: "yr8", label: "12 and in Year 8" },
  { value: "yr7_starting_yr8", label: "12 and in Year 7, starting Year 8 in September" },
  { value: "13_plus", label: "13 and over" },
  { value: "under_12", label: "12 and under (not yet in Year 8)" },
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
