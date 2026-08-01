// Central content for 1471 Horwich Squadron RAF Air Cadets website.
import {
  Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy,
  TentTree, Shield, BookOpen, HeartHandshake, GraduationCap, Users,
  Globe2, FileText, BadgeCheck, Briefcase, Sailboat, Target, Rocket,
} from "lucide-react";

export const CREST_URL =
  "https://customer-assets.emergentagent.com/job_283d297f-7217-4e9a-b0b5-b0baa4b4d8bf/artifacts/nmvg3tzu_1471%20crest%20transparent.png";

// Squadron photographs (served locally from /public/squadron)
const IMG = (f) => `/squadron/${f}`;

export const SKY_HERO = IMG("flying/flying-up-in-the-sky.jpg");
export const CLOUDS_WIDE = IMG("flying/flying-cadets-on-the-flightline.jpg");
export const ABOUT_IMG = IMG("awards/parade-evening-awards-night.jpg");
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
    strapline: "Take your first steps from runway to cockpit.",
    quickFacts: ["RAF Air Cadets flying opportunities", "Powered aircraft experience", "Subject to availability and eligibility"],
    whatToExpect: [
      "Pre-flight briefings and safety checks with staff guidance",
      "Hands-on exposure to cockpit controls and airmanship basics",
      "A memorable sortie that builds confidence in aviation settings",
    ],
    image: IMG("flying/flying-cadets-ready-for-flight.jpg"),
    video: IMG("flying/flying.mp4"),
    gallery: [
      { src: IMG("flying/flying.mp4"), type: "video", caption: "Flying with the RAF Air Cadets" },
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
    strapline: "Experience quiet flight and precision in the air.",
    quickFacts: ["Winch/tow launch environment", "Team-led airfield routines", "Weather and safety dependent"],
    whatToExpect: [
      "Airfield teamwork supporting launch and recovery routines",
      "Learning how lift, balance and control work in a glider",
      "A focused flying experience that grows calm decision-making",
    ],
    image: IMG("gliding/gliding-cadet-in-glider.jpg"),
    video: IMG("gliding/glider take off - internal.mp4"),
    gallery: [
      { src: IMG("gliding/glider take off - internal.mp4"), type: "video", caption: "Inside the glider at launch" },
      { src: IMG("gliding/gliding - take off.mp4"), type: "video", caption: "Take-off from the airfield" },
      { src: IMG("gliding/20230617_103435.mp4"), type: "video", caption: "Glider launch" },
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
    strapline: "Push your comfort zone in the outdoors.",
    quickFacts: ["Climbing, hill and paddlesport themes", "Instructor-led and supervised", "Progressive challenge levels"],
    whatToExpect: [
      "Outdoor challenges designed to build grit and self-belief",
      "Working in teams to solve route, movement and safety tasks",
      "Structured adventures that reward preparation and attitude",
    ],
    image: IMG("adventure_training/adventure_training_images (1).jpg"),
    gallery: [
      { src: IMG("adventure_training/adventure_training_images (1).jpg"), caption: "Adventure training" },
      { src: IMG("adventure_training/adventure_training_images (2).jpg"), caption: "Team challenge outdoors" },
      { src: IMG("adventure_training/adventure_training_images (3).jpg"), caption: "Outdoor skills development" },
      { src: IMG("adventure_training/adventure_training_images (4).jpg"), caption: "Working as a team" },
      { src: IMG("adventure_training/adventure_training_images (6).jpg"), caption: "Adventure activity" },
      { src: IMG("adventure_training/adventure_training_images (7).jpg"), caption: "Challenge and resilience" },
      { src: IMG("adventure_training/adventure_training_images (8).jpg"), caption: "Hill and outdoor training" },
      { src: IMG("adventure_training/Road marching.jpg"), caption: "Road marching exercise" },
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
    slug: "overseas-camp", title: "Overseas Camp", icon: Sailboat,
    strapline: "Travel, challenge and bond on an international camp.",
    quickFacts: ["International destinations", "Team-focused camp programme", "Eligibility and places apply"],
    whatToExpect: [
      "Shared travel and camp routines that build independence",
      "Adventure sessions and cultural experiences with your team",
      "A confidence-boosting trip you will remember for years",
    ],
    image: IMG("overseas/overseas-1-group-photo.jpg"),
    gallery: [
      { src: IMG("overseas/overseas-1-group-photo.jpg"), caption: "The team on an overseas trip" },
      { src: IMG("overseas/20260526_131607.jpg"), caption: "Arrival and briefing" },
      { src: IMG("overseas/20260526_131759.jpg"), caption: "Camp activity preparation" },
      { src: IMG("overseas/20260526_141606.jpg"), caption: "Outdoor challenge activity" },
      { src: IMG("overseas/20260526_174730.jpg"), caption: "Teamwork in action" },
      { src: IMG("overseas/20260526_211935.jpg"), caption: "Evening camp atmosphere" },
      { src: IMG("overseas/20260526_211945.jpg"), caption: "Camp life with the team" },
      { src: IMG("overseas/20260527_145947(0).jpg"), caption: "Cadets exploring overseas" },
    ],
    text: "International camp experiences focused on teamwork, independence and cultural adventure.",
    long: [
      "Overseas camps give cadets the chance to take part in unforgettable trips abroad, combining adventure, team activities and personal development.",
      "These opportunities are planned and supervised through RAF Air Cadets procedures, with places, dates and destinations based on availability and eligibility.",
    ],
    highlights: [
      "Take part in a structured overseas camp experience",
      "Build confidence and independence away from home",
      "Develop teamwork with cadets across activities",
      "Gain memorable international experiences where available",
    ],
  },
  {
    slug: "dofe", title: "Duke of Edinburgh\u2019s Award", icon: Award,
    strapline: "Earn a respected award with real-world value.",
    quickFacts: ["Bronze, Silver and Gold pathways", "Volunteering + physical + skill", "Expedition at each level"],
    whatToExpect: [
      "Setting personal goals and tracking your progress over time",
      "Building resilience through expedition planning and delivery",
      "A strong achievement you can use in CVs and applications",
    ],
    image: IMG("d_of_e/dofe_images (1).jpg"),
    gallery: [
      { src: IMG("d_of_e/dofe_images (1).jpg"), caption: "DofE expedition preparation" },
      { src: IMG("d_of_e/dofe_images (2).jpg"), caption: "On expedition" },
      { src: IMG("d_of_e/dofe_images (3).jpg"), caption: "DofE teamwork" },
      { src: IMG("d_of_e/dofe_images (4).jpg"), caption: "Expedition route" },
      { src: IMG("d_of_e/dofe_images (5).jpg"), caption: "DofE milestone" },
    ],
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
    strapline: "Learn skills that can genuinely help save lives.",
    quickFacts: ["Practical casualty care skills", "Scenario-based learning", "Recognised qualification routes"],
    whatToExpect: [
      "Realistic emergency scenarios to build calm, clear action",
      "Core treatment skills such as recovery position and CPR",
      "Confidence to step forward when someone needs help",
    ],
    image: IMG("first_aid/first_aid_images (1).jpg"),
    gallery: [
      { src: IMG("first_aid/first_aid_images (1).jpg"), caption: "First aid training" },
      { src: IMG("first_aid/first_aid_images (2).jpg"), caption: "Casualty care scenario" },
      { src: IMG("first_aid/first_aid_images (3).jpg"), caption: "Practical first aid skills" },
      { src: IMG("first_aid/first_aid_images (4).jpg"), caption: "Learning emergency response" },
      { src: IMG("first_aid/first_aid_images (5).jpg"), caption: "First aid in practice" },
      { src: IMG("first_aid/first_aid_images (6).jpg"), caption: "Developing confidence to act" },
      { src: IMG("first_aid/first_aid_images (7).jpg"), caption: "First aid team practice" },
    ],
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
    strapline: "Lead teams, make decisions and grow your voice.",
    quickFacts: ["Team challenge formats", "Communication under pressure", "NCO progression opportunities"],
    whatToExpect: [
      "Planning and briefing teammates for practical challenges",
      "Rotating leadership roles to build confidence and adaptability",
      "Feedback-driven development that sharpens decision-making",
    ],
    image: IMG("leadership/SMEAC leadership.png"),
    gallery: [
      { src: IMG("leadership/SMEAC leadership.png"), caption: "SMEAC leadership framework in practice" },
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
    slug: "awards", title: "Awards", icon: Award,
    strapline: "Celebrate achievement and progression across cadet life.",
    quickFacts: ["Recognition evenings", "Cadet progression milestones", "Squadron achievement culture"],
    whatToExpect: [
      "Working towards goals that are formally recognised",
      "Celebrating personal and team achievements with the squadron",
      "Building pride and motivation through clear progression",
    ],
    image: IMG("awards/presentation-evening-2.jpg"),
    gallery: [
      { src: IMG("awards/presentation-evening-1.jpg"), caption: "Presentation evening" },
      { src: IMG("awards/presentation-evening-2.jpg"), caption: "Recognising achievement" },
      { src: IMG("awards/presentation-evening-3.jpg"), caption: "Awards and progression" },
      { src: IMG("awards/parade-evening-awards-night.jpg"), caption: "Awards night on parade" },
      { src: IMG("awards/flying-award-1.jpg"), caption: "Flying award ceremony" },
      { src: IMG("awards/flying-award-2.jpg"), caption: "Celebrating a flying achievement" },
    ],
    text: "Squadron awards highlight effort, development, leadership and commitment across the year.",
    long: [
      "Awards are an important part of cadet motivation and progression, recognising effort, improvement and contribution in a structured way.",
      "From parade-night achievements to formal presentation evenings, cadets can celebrate milestones with their peers, families and staff.",
    ],
    highlights: [
      "Work towards recognised squadron milestones",
      "Celebrate effort, commitment and progression",
      "Build confidence through public recognition",
      "Use achievements to support future applications",
    ],
  },
  {
    slug: "fieldcraft", title: "Fieldcraft", icon: Tent,
    strapline: "Master outdoor skills and teamwork in the field.",
    quickFacts: ["Navigation and movement skills", "Structured day/night exercises", "Progressive field training"],
    whatToExpect: [
      "Map-reading and route-planning in realistic environments",
      "Team movement, communication and problem-solving drills",
      "Hands-on field sessions that reward discipline and teamwork",
    ],
    image: IMG("fieldcraft/20260721_083302 (1).jpg"),
    video: IMG("fieldcraft/VID-20260725-WA0029.mp4"),
    gallery: [
      { src: IMG("fieldcraft/VID-20260725-WA0029.mp4"), type: "video", caption: "Fieldcraft exercise footage" },
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
    strapline: "Compete, improve fitness and represent your squadron.",
    quickFacts: ["Individual and team events", "Squadron to corps-level opportunities", "Inclusive participation"],
    whatToExpect: [
      "Regular activity that boosts fitness, energy and wellbeing",
      "Friendly competition with clear goals and progression",
      "Team spirit and pride when representing the squadron",
    ],
    image: IMG("sport/archery 1.jpg"),
    gallery: [
      { src: IMG("sport/archery 1.jpg"), caption: "Archery on the range" },
      { src: IMG("sport/archery (1).jpg"), caption: "Archery training" },
      { src: IMG("sport/archery (2).jpg"), caption: "Taking aim" },
      { src: IMG("sport/wing competition day 3 - archery.jpg"), caption: "Wing competition day — archery" },
      { src: IMG("sport/20250622_104409.jpg"), caption: "Sport activity" },
      { src: IMG("sport/20250622_104502(1).jpg"), caption: "Training session" },
      { src: IMG("sport/20250907_120709.jpg"), caption: "Squadron sport day" },
      { src: IMG("sport/20250907_120821.jpg"), caption: "Competing as a team" },
      { src: IMG("sport/20250609_201203.jpg"), caption: "Sport at the squadron" },
      { src: IMG("sport/20250609_202353.jpg"), caption: "Team sport event" },
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
    strapline: "Step beyond parade nights into unforgettable camps.",
    quickFacts: ["Multi-day cadet experiences", "Team living and shared routines", "Subject to place allocation"],
    whatToExpect: [
      "A packed timetable of activities with cadets from wider areas",
      "New environments that develop confidence away from home",
      "Strong friendships and standout moments across the week",
    ],
    image: IMG("camps/20210918_144523.jpg"),
    gallery: [
      { src: IMG("camps/20210918_144523.jpg"), caption: "Cadets on camp" },
    ],
    text: "Cadets may attend multi-day camps that develop independence, teamwork and confidence.",
    long: [
      "Camps are some of the most memorable experiences in cadet life, giving young people the chance to train, socialise and take on new challenges over several days.",
      "Places are subject to availability, eligibility and RAFAC procedures.",
    ],
    highlights: [
      "Attend multi-day camps where available",
      "Develop independence away from home",
      "Make friends and memories beyond the squadron",
      "Take on new challenges away from home",
    ],
  },
  {
    slug: "raf-station-visits", title: "RAF Station Visits", icon: Plane,
    strapline: "Step onto active RAF stations and see operations up close.",
    quickFacts: ["Operational RAF environments", "Guided tours and aircraft access", "Aviation and careers inspiration"],
    whatToExpect: [
      "Visiting working RAF stations with squadron staff supervision",
      "Seeing aircraft and engineering environments up close",
      "Learning directly from RAF personnel and subject specialists",
    ],
    image: IMG("raf_station_visits/raf-station-visit-bbmf-group-photo.jpg"),
    gallery: [
      { src: IMG("raf_station_visits/raf-station-visit-bbmf-group-photo.jpg"), caption: "Group photo at a station visit" },
      { src: IMG("raf_station_visits/20240221_131627.jpg"), caption: "Cadets on station visit" },
      { src: IMG("raf_station_visits/raf-station-visit-1-cadet-in-a-typhoon-raf-coningsby.jpg"), caption: "A cadet in a Typhoon, RAF Coningsby" },
      { src: IMG("raf_station_visits/raf-station-visit-1-raf-typhoon.jpg"), caption: "Up close with an RAF Typhoon" },
      { src: IMG("raf_station_visits/raf-station-visit-1-tour-round-a-typhoon-by-raf-pilot.jpg"), caption: "A tour of the Typhoon with an RAF pilot" },
      { src: IMG("raf_station_visits/raf-station-visit-2-bbmf-spitfire.jpg"), caption: "BBMF Spitfire" },
      { src: IMG("raf_station_visits/raf-station-visit-2-bbmf-lancaster.jpg"), caption: "BBMF Lancaster" },
      { src: IMG("raf_station_visits/20230222_143313.jpg"), caption: "Station visit" },
      { src: IMG("raf_station_visits/20230222_143740.jpg"), caption: "Aircraft up close" },
      { src: IMG("raf_station_visits/20230222_153101(0).jpg"), caption: "Station tour" },
      { src: IMG("raf_station_visits/20240221_140453.jpg"), caption: "Cadets at the station" },
      { src: IMG("raf_station_visits/20241030_103304.jpg"), caption: "Station visit 2024" },
      { src: IMG("raf_station_visits/20241030_103644.jpg"), caption: "Aviation and operations" },
      { src: IMG("raf_station_visits/20241030_110404.jpg"), caption: "Learning from RAF personnel" },
      { src: IMG("raf_station_visits/20241030_135453.jpg"), caption: "Exploring the station" },
    ],
    text: "RAF station visits let cadets experience frontline aviation, heritage aircraft and station life first-hand.",
    long: [
      "RAF station visits are a highlight for many cadets, offering access to military aviation environments and opportunities to learn from serving personnel.",
      "These visits connect cadet training to real-world RAF operations and help inspire future goals in aviation and engineering.",
    ],
    highlights: [
      "Visit RAF stations and specialist aviation locations",
      "See operational and heritage aircraft up close",
      "Learn from RAF staff and aviation professionals",
      "Build motivation for future aviation pathways",
    ],
  },
  {
    slug: "airshows", title: "Airshows", icon: Plane,
    strapline: "See world-class aircraft and aviation teams up close.",
    quickFacts: ["Major UK airshow visits", "Aircraft access and static displays", "Aviation inspiration and careers insight"],
    whatToExpect: [
      "Experiencing live flying displays from historic and modern aircraft",
      "Exploring static aircraft, exhibits and interactive aviation areas",
      "Learning from real RAF and aerospace environments with fellow cadets",
    ],
    image: IMG("air_shows/cosford airshow 4 - access all areas.jpg"),
    gallery: [
      { src: IMG("air_shows/cosford (1).jpg"), caption: "Cosford airshow visit" },
      { src: IMG("air_shows/cosford (2).jpg"), caption: "Airshow display line" },
      { src: IMG("air_shows/cosford (3).jpg"), caption: "Cadets at Cosford" },
      { src: IMG("air_shows/cosford airshow 4 - access all areas.jpg"), caption: "Air show access-all-areas experience" },
      { src: IMG("air_shows/riat (1).JPG"), caption: "Cadets at RIAT" },
      { src: IMG("air_shows/riat (2).JPG"), caption: "Aircraft and air power insight" },
      { src: IMG("air_shows/riat (3).JPG"), caption: "Airshow day at RIAT" },
      { src: IMG("air_shows/riat (4).JPG"), caption: "Cadets at RIAT" },
      { src: IMG("air_shows/riat (5).JPG"), caption: "Flightline atmosphere" },
    ],
    text: "Airshow trips bring cadets face-to-face with military aviation, heritage aircraft and aerospace opportunities.",
    long: [
      "Airshows are a standout cadet experience, offering the chance to see aircraft, crews and display teams in action at major events.",
      "From flightline views to static exhibits, these visits help cadets connect classroom aviation knowledge with the real world.",
    ],
    highlights: [
      "Visit major UK airshows such as RIAT and Cosford",
      "See frontline and historic aircraft up close",
      "Build aviation knowledge through real environments",
      "Share an unforgettable day with your squadron",
    ],
  },
  {
    slug: "drill-and-uniform", title: "Drill and Uniform", icon: Shield,
    strapline: "Build pride, bearing and precision as a cadet.",
    quickFacts: ["Ceremonial and parade skills", "Uniform standards", "Public representation opportunities"],
    whatToExpect: [
      "Drill sessions focused on timing, teamwork and discipline",
      "Learning how to prepare and wear uniform with pride",
      "Parades and events where cadets represent the squadron",
    ],
    image: IMG("parades/parade 1 - confirmation of the King 1.jpg"),
    gallery: [
      { src: IMG("parades/parade 1 - confirmation of the King 1.jpg"), caption: "On parade" },
      { src: IMG("parades/parade_images (1).jpg"), caption: "Ceremonial bearing" },
      { src: IMG("parades/parade_images (2).jpg"), caption: "Squadron parade" },
      { src: IMG("parades/parade_images (3).jpg"), caption: "Uniform and bearing" },
      { src: IMG("parades/20220911_122531.jpg"), caption: "Parade day" },
      { src: IMG("parades/20220911_130934(0).jpg"), caption: "Marching with pride" },
      { src: IMG("drill_training/drill training.jpg"), caption: "Drill training" },
      { src: IMG("drill_training/drill training 2.jpg"), caption: "Drill practice" },
      { src: IMG("drill_training/drill training 3.jpg"), caption: "Precision and teamwork" },
      { src: IMG("rememberance/rememberance-parade-1.jpg"), caption: "Remembrance parade" },
      { src: IMG("rememberance/rememberance-sunday-parade-1.jpg"), caption: "Remembrance Sunday" },
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
    slug: "classification-training", title: "Classification Training", icon: GraduationCap,
    strapline: "Progress through the cadet syllabus and grow your aviation knowledge.",
    quickFacts: ["Structured training levels", "Classroom and practical learning", "Supports cadet badge progression"],
    whatToExpect: [
      "Lessons that build understanding step-by-step across key topics",
      "Interactive sessions on propulsion, principles of flight and aviation systems",
      "Clear progression milestones as confidence and knowledge grow",
    ],
    image: IMG("classification_training/training - propulsion.jpg"),
    gallery: [
      { src: IMG("classification_training/training - propulsion.jpg"), caption: "Classification training: propulsion" },
      { src: IMG("classification_training/training - propulsion 2.jpg"), caption: "Classification lesson" },
      { src: IMG("classification_training/20250607_120534.jpg"), caption: "Classroom session" },
      { src: IMG("classification_training/20250607_120541.jpg"), caption: "Cadets in instruction" },
      { src: IMG("classification_training/20250607_120544.jpg"), caption: "Learning as a team" },
      { src: IMG("classification_training/Screenshot 2025-05-21 194351.png"), caption: "Training content and study resources" },
      { src: IMG("classification_training/Screenshot 2025-05-21 194444.png"), caption: "Classification learning materials" },
    ],
    text: "Classification Training develops cadet knowledge across aviation, air power and related subjects through progressive study levels.",
    long: [
      "Classification Training gives cadets a clear learning pathway, helping them build technical and aviation knowledge over time.",
      "As cadets progress, they develop confidence in classroom learning, practical understanding and wider cadet syllabus achievement.",
    ],
    highlights: [
      "Progress through structured classification levels",
      "Build strong aviation and air power knowledge",
      "Support wider cadet development and badges",
      "Develop confidence in study and presentation skills",
    ],
  },
  {
    slug: "aviation-studies", title: "Aviation Studies", icon: BookOpen,
    strapline: "Turn aviation curiosity into real technical knowledge.",
    quickFacts: ["Flight principles and air power topics", "Classroom + practical blend", "Supports cadet syllabus progression"],
    whatToExpect: [
      "Interactive learning on aircraft systems and aerodynamics",
      "Navigation and aviation theory linked to cadet badges",
      "Applied learning through simulators, STEM and visits",
    ],
    image: IMG("flight_sim/flight-sim-1.jpg"),
    gallery: [
      { src: IMG("flight_sim/flight-sim-1.jpg"), caption: "On the flight simulator" },
      { src: IMG("flight_sim/flight-sim-2.jpg"), caption: "Learning the controls" },
      { src: IMG("flight_sim/flight-sim-3.jpg"), caption: "Putting theory into practice" },
      { src: IMG("careeers-days/careers-day-at-mbda.jpg"), caption: "Careers day at MBDA" },
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
    strapline: "Make a difference while wearing the squadron badge.",
    quickFacts: ["Parades and remembrance events", "Fundraising and local support", "Visible public-facing role"],
    whatToExpect: [
      "Representing the squadron at meaningful civic occasions",
      "Supporting charity and community causes as a team",
      "Building pride, confidence and a sense of service",
    ],
    image: IMG("community/community (1).jpg"),
    gallery: [
      { src: IMG("community/community (1).jpg"), caption: "Community activity" },
      { src: IMG("community/community (2).jpg"), caption: "Cadets in the community" },
      { src: IMG("community/community (3).jpg"), caption: "Representing the squadron" },
      { src: IMG("community/community (4).jpg"), caption: "Community engagement" },
      { src: IMG("community/community (5).jpg"), caption: "Serving the local area" },
      { src: IMG("community/community (6).jpg"), caption: "Squadron in the community" },
      { src: IMG("community/community (7).jpg"), caption: "Public service role" },
      { src: IMG("community/community (8).jpg"), caption: "Community pride" },
      { src: IMG("rememberance/poppy-appeal-collecting.jpg"), caption: "Collecting for the Poppy Appeal" },
      { src: IMG("rememberance/poppy-appeal-collecting-2.jpg"), caption: "Supporting the Poppy Appeal" },
      { src: IMG("fundraising/20241102_124752.jpg"), caption: "Community fundraising" },
      { src: IMG("fundraising/20251101_092450.jpg"), caption: "Cadets supporting a local appeal" },
      { src: IMG("fundraising/20251101_131631.jpg"), caption: "Fundraising in the community" },
      { src: IMG("fundraising/poppy appeal collecting.jpg"), caption: "Poppy Appeal collection" },
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
  {
    slug: "shooting", title: "Shooting", icon: Target,
    strapline: "Build focus, discipline and precision on the range.",
    quickFacts: ["Air rifle and target shooting", "Disciplined, coached environment", "Wing and corps competition opportunities"],
    whatToExpect: [
      "Coaching in safe handling, stance and breath control",
      "Structured target sessions that build precision and focus",
      "The opportunity to represent the squadron in competition",
    ],
    image: IMG("shooting/shooting (1).jpg"),
    gallery: [
      { src: IMG("shooting/shooting (1).jpg"), caption: "On the range" },
      { src: IMG("shooting/shooting (2).jpg"), caption: "Taking aim" },
      { src: IMG("shooting/shooting (3).jpg"), caption: "Precision shooting" },
      { src: IMG("shooting/shooting (4).jpg"), caption: "Coached session on the range" },
      { src: IMG("shooting/shooting (5).jpg"), caption: "Concentration and discipline" },
      { src: IMG("shooting/shooting (6).jpg"), caption: "Squadron shooting activity" },
      { src: IMG("shooting/shooting.jpg"), caption: "Shooting with 1471 Squadron" },
    ],
    text: "Cadets develop marksmanship skills through coached range sessions, with competition opportunities at wing and corps level.",
    long: [
      "Shooting is a sport of precision, discipline and focus. Cadets learn safe handling, correct technique and how to read their own performance under the guidance of trained range staff.",
      "Sessions build concentration and self-control, and cadets can progress through range classifications to represent the squadron at wing and corps shooting competitions.",
    ],
    highlights: [
      "Learn safe handling and correct shooting technique",
      "Develop concentration, discipline and accuracy",
      "Progress through range classification levels",
      "Represent the squadron at shooting competitions",
    ],
  },
  {
    slug: "stem", title: "STEM", icon: Rocket,
    strapline: "Explore science, technology, engineering and maths through aviation.",
    quickFacts: ["Hands-on practical challenges", "Links to aviation and aerospace", "Supports cadet syllabus progression"],
    whatToExpect: [
      "Practical projects and challenges rooted in real science and engineering",
      "Links to aviation, space and technology that connect to classroom learning",
      "Team problem-solving that builds critical thinking and communication skills",
    ],
    image: IMG("stem/stem 3 - 1.jpg"),
    gallery: [
      { src: IMG("stem/stem 3 - 1.jpg"), caption: "STEM challenge" },
      { src: IMG("stem/stem 3 - 2.jpg"), caption: "Team engineering task" },
      { src: IMG("stem/stem 3 - 3.jpg"), caption: "Hands-on learning" },
      { src: IMG("stem/stem 3 - 4.jpg"), caption: "Engineering in action" },
      { src: IMG("stem/20260510_114429.jpg"), caption: "STEM session" },
      { src: IMG("stem/20260510_132217.jpg"), caption: "Problem solving" },
      { src: IMG("stem/20260510_135742.jpg"), caption: "Building and testing" },
      { src: IMG("stem/20260510_135743.jpg"), caption: "Practical STEM activity" },
      { src: IMG("stem/stem_images (1).jpeg"), caption: "STEM exploration" },
      { src: IMG("stem/stem_images (2).jpeg"), caption: "Team science challenge" },
      { src: IMG("stem/stem_images (3).jpeg"), caption: "STEM at 1471 Squadron" },
      { src: IMG("staff_development/stem 1.jpg"), caption: "STEM officer in action" },
    ],
    text: "Practical STEM activities link aviation knowledge to real science and engineering challenges, inspiring future careers in technical fields.",
    long: [
      "STEM activities bring science, technology, engineering and maths to life through practical challenges that connect directly to aviation and aerospace.",
      "Sessions are designed to stretch thinking, develop problem-solving skills and inspire cadets to explore study and careers in technical fields including engineering, computing and aerospace.",
    ],
    highlights: [
      "Take part in hands-on STEM challenges",
      "Connect aviation knowledge to real science and engineering",
      "Develop problem-solving and analytical thinking",
      "Explore pathways in aerospace and technology",
    ],
  },
  {
    slug: "remembrance", title: "Remembrance", icon: HeartHandshake,
    strapline: "Honour those who served and represent the squadron with pride.",
    quickFacts: ["Annual remembrance parades", "Concerts and civic events", "Visible public service role"],
    whatToExpect: [
      "Preparing carefully and marching with the squadron at significant civic occasions",
      "Taking part in remembrance concerts and special commemorative events",
      "Building pride, discipline and a deep sense of the history behind the uniform",
    ],
    image: IMG("rememberance/rememberance-parade-1.jpg"),
    gallery: [
      { src: IMG("rememberance/rememberance-parade-1.jpg"), caption: "Remembrance parade" },
      { src: IMG("rememberance/rememberance-sunday-parade-1.jpg"), caption: "Remembrance Sunday" },
      { src: IMG("rememberance/Rememberance.jpg"), caption: "Honouring those who served" },
      { src: IMG("rememberance/parade_images (4).jpg"), caption: "On parade" },
      { src: IMG("rememberance/parade_images (5).jpg"), caption: "Remembrance ceremony" },
      { src: IMG("rememberance/parade_images (7).jpg"), caption: "Representing the squadron" },
      { src: IMG("rememberance/parade_images (8).jpg"), caption: "Remembrance parade day" },
      { src: IMG("rememberance/poppy-appeal-1.jpg"), caption: "Poppy Appeal" },
      { src: IMG("rememberance/poppy-appeal-collecting.jpg"), caption: "Collecting for the Poppy Appeal" },
      { src: IMG("rememberance/poppy-appeal-collecting-2.jpg"), caption: "Supporting the Poppy Appeal" },
      { src: IMG("rememberance_concert/rememberance-concert-bolton-1.jpg"), caption: "Remembrance concert, Bolton" },
      { src: IMG("rememberance_concert/rememberance concert.jpg"), caption: "Remembrance concert performance" },
      { src: IMG("rememberance_concert/rememberance-concert-2.jpg"), caption: "Concert in honour" },
      { src: IMG("rememberance_concert/rememberance-concert-3.jpg"), caption: "Honouring through music" },
      { src: IMG("rememberance_concert/20221110_213813.jpg"), caption: "Remembrance concert 2022" },
    ],
    text: "Cadets represent the squadron at remembrance parades, concerts and civic events — one of the most meaningful parts of cadet service.",
    long: [
      "Remembrance is one of the most meaningful parts of cadet service. Each year, cadets prepare and march at remembrance parades across the local area, honouring those who gave their lives in conflict.",
      "The squadron also takes part in remembrance concerts and civic events, bringing a visible cadet presence to important community occasions and building pride, discipline and a deep sense of purpose.",
    ],
    highlights: [
      "March with the squadron at remembrance parades",
      "Represent 1471 Horwich at civic and community events",
      "Take part in remembrance concerts and ceremonies",
      "Develop bearing, pride and a sense of service",
    ],
  },
  {
    slug: "fun-activities", title: "Fun Activities", icon: Trophy,
    strapline: "Experience new thrills and enjoy the best of cadet life together.",
    quickFacts: ["Activity days and special trips", "Team-bonding experiences", "Something for everyone"],
    whatToExpect: [
      "Activity days that bring the whole squadron together for shared experiences",
      "New challenges in exciting environments, from go-karting to adventure activities",
      "Memorable moments that build confidence, friendship and squadron spirit",
    ],
    image: IMG("Fun/fun-go-karting-team-photo.jpg"),
    gallery: [
      { src: IMG("Fun/fun-go-karting-team-photo.jpg"), caption: "Go-karting team photo" },
      { src: IMG("Fun/fun-go-karting-brief.jpg"), caption: "Safety brief before the race" },
      { src: IMG("Fun/fun-go-karting-ready-to-go.jpg"), caption: "Ready to race" },
      { src: IMG("Fun/fun-go-karting-in-the-pits.jpg"), caption: "In the pits" },
      { src: IMG("Fun/fun (1).jpg"), caption: "Fun activity day" },
      { src: IMG("Fun/fun (2).jpg"), caption: "Squadron activity" },
      { src: IMG("Fun/fun (3).jpg"), caption: "Making memories together" },
    ],
    text: "Beyond parade nights, cadets enjoy activity days and special events that build friendship, confidence and squadron spirit.",
    long: [
      "Cadet life isn't just about training \u2014 it's also about having fun together as a team. Activity days give the whole squadron a chance to try something new in a relaxed, high-energy environment.",
      "From go-karting to adventure days, fun activities build friendship, confidence and the kind of shared memories that make cadet life truly memorable.",
    ],
    highlights: [
      "Take part in activity days and special trips",
      "Try new thrilling experiences as a team",
      "Build friendships and squadron spirit",
      "Create memories that last beyond cadet life",
    ],
  },
];

export const getActivity = (slug) => ACTIVITIES.find((a) => a.slug === slug);

/**
 * Per-activity CSS object-position class for banner and card images.
 * Only activities that need something other than the CSS default (center) are listed.
 * Used by ActivityDetailPage and Activities card grid.
 */
export const ACTIVITY_FOCUS = {
  "flying":              "object-top",       // cadets standing ready for flight
  "overseas-camp":       "object-top",       // group standing outdoors
  "awards":              "object-top",       // presentation ceremony, faces at top
  "sport":               "object-top",       // archery stance — head/bow at top
  "raf-station-visits":  "object-top",       // group photo, faces at top
  "drill-and-uniform":   "object-top",       // parade marchers
  "remembrance":         "object-top",       // parade column
  "fun-activities":      "object-top",       // group at go-kart track
  "camps":              "object-top",       // cadets on camp, people visible
  "leadership":         "object-top",       // leadership activity/framework
  "fieldcraft":          "object-[50%_35%]", // early-morning scene, horizon mid-frame
  "classification-training": "object-top",  // cadets at desks, faces visible top
  "shooting":            "object-[50%_40%]", // prone position, subject mid-frame
  "first-aid":           "object-top",       // training scenario, faces top
  "adventure-training":  "object-top",       // outdoor group
};

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
  { value: "13_plus", label: "13 and over" },
  { value: "yr8", label: "12 and already in Year 8" },
  { value: "yr7_starting_yr8", label: "12 but still in Year 7 (starts Year 8 in September)" },
  { value: "under_12", label: "Under 12" },
];

export const FAQS = [
  { q: "Which areas does 1471 Horwich Squadron serve?", a: "We welcome young people from Horwich and the surrounding area, including Westhoughton, Adlington, Blackrod, Lostock and other nearby communities across the Bolton area and Greater Manchester. If you are within travelling distance of Horwich, get in touch and we will be happy to help." },
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
  { q: "How do I contact 1471 Horwich Squadron?", a: "You can use the enquiry form on this website, or reach us through our Facebook page. Our headquarters is at St Joseph\u2019s Secondary School & Sports College, Chorley New Road, Horwich, BL6 6HW \u2014 convenient for Horwich, Westhoughton, Adlington, Blackrod, Lostock and the wider Bolton area." },
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
