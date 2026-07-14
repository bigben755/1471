import { useState } from "react";
import { VOLUNTEER_ROLES } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal, SectionHeading } from "./Reveal";
import { Roundel } from "./Motifs";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  Compass,
  GraduationCap,
  Handshake,
  HeartPulse,
  Medal,
  MonitorUp,
  Package,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";

const SERVICE_ROUTES = [
  {
    id: "commissioned",
    title: "Commissioned Officer",
    shortTitle: "Officer",
    eyebrow: "Uniformed route",
    icon: Medal,
    summary:
      "A leadership-focused route for volunteers who want to help command, manage and develop the squadron.",
    details:
      "Commissioned Officers undertake leadership and management responsibilities, support the delivery of training and activities, and may progress towards appointments such as Squadron Commander.",
    goodFor: [
      "Leading people and setting direction",
      "Planning and coordinating activity",
      "Developing cadets and other volunteers",
      "Taking wider responsibility for the squadron",
    ],
  },
  {
    id: "snco",
    title: "Senior Non-Commissioned Officer",
    shortTitle: "Sergeant or SNCO",
    eyebrow: "Uniformed route",
    icon: BadgeCheck,
    summary:
      "A practical leadership route with a strong focus on standards, instruction, mentoring and cadet development.",
    details:
      "Adult Sergeants and other SNCOs help maintain standards, instruct cadets, support discipline and drill, mentor cadet NCOs and play a major role in the day-to-day running of the squadron.",
    goodFor: [
      "Practical instruction and mentoring",
      "Drill, standards and teamwork",
      "Working directly with cadets",
      "Leading activities and parade nights",
    ],
  },
  {
    id: "ci",
    title: "Civilian Instructor",
    shortTitle: "Civilian Instructor",
    eyebrow: "Non-uniformed route",
    icon: Users,
    summary:
      "A flexible way to volunteer without wearing uniform while remaining fully involved in squadron life.",
    details:
      "Civilian Instructors can teach, supervise, organise activities, hold specialist responsibilities and support almost every aspect of the cadet experience.",
    goodFor: [
      "Sharing professional or personal skills",
      "Supporting activities without wearing uniform",
      "Teaching or mentoring young people",
      "Taking on a specialist squadron responsibility",
    ],
  },
  {
    id: "committee",
    title: "Civilian Committee",
    shortTitle: "Committee Member",
    eyebrow: "Governance and support",
    icon: Handshake,
    summary:
      "Support the squadron behind the scenes through governance, fundraising, finance and community connections.",
    details:
      "Civilian Committee members help ensure the squadron is well governed and properly supported. Although they do not deliver cadet training, they remain closely involved in enabling opportunities for local young people.",
    goodFor: [
      "Fundraising and financial oversight",
      "Governance and community engagement",
      "Supporting facilities and equipment",
      "Helping without becoming a CFAV",
    ],
  },
];

const SPECIALIST_AREAS = [
  {
    id: "training",
    title: "Training and cadet development",
    icon: ClipboardList,
    roles: [
      "Training Officer",
      "First Aid Officer",
      "STEM Officer",
      "Space Officer",
      "Flight Simulator Officer",
    ],
    description:
      "Plan engaging training, coordinate progression and help cadets develop practical knowledge, confidence and qualifications.",
  },
  {
    id: "adventure",
    title: "Outdoor and practical activity",
    icon: Compass,
    roles: [
      "Adventure Training Officer",
      "Duke of Edinburgh’s Award Officer",
      "Fieldcraft Officer",
      "Shooting Officer",
      "Sports Officer",
    ],
    description:
      "Help create challenging experiences through sport, expeditions, fieldcraft, marksmanship and outdoor development.",
  },
  {
    id: "operations",
    title: "Squadron operations",
    icon: Wrench,
    roles: [
      "Adjutant",
      "Stores Officer",
      "Health and Safety Officer",
      "Training Officer",
    ],
    description:
      "Keep the squadron organised, safe, properly equipped and able to deliver a reliable programme for its cadets.",
  },
  {
    id: "community",
    title: "Community and communications",
    icon: Radio,
    roles: [
      "Community Liaison Officer",
      "Recruitment support",
      "Events and engagement",
      "Communications support",
    ],
    description:
      "Build relationships with schools, community groups, local organisations and families while promoting the squadron’s work.",
  },
];

const DEVELOPMENT_OPPORTUNITIES = [
  {
    icon: GraduationCap,
    title: "Leadership and management",
    text: "Develop practical experience in leading teams, organising activities, mentoring others and managing competing priorities.",
  },
  {
    icon: ShieldCheck,
    title: "Risk and safety",
    text: "Build experience in activity planning, risk assessment, safe systems of training and responsible decision-making.",
  },
  {
    icon: HeartPulse,
    title: "First aid",
    text: "Complete first aid training and potentially progress towards qualifications that support wider activities and instruction.",
  },
  {
    icon: Trophy,
    title: "Coaching and instruction",
    text: "Develop presentation, coaching and instructional skills that are transferable into education, supervision and management roles.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career development",
    text: "Gain credible examples of leadership, teamwork, planning, safeguarding, communication and community engagement.",
  },
  {
    icon: Sparkles,
    title: "Personal confidence",
    text: "Challenge yourself, learn new skills, meet new people and become part of a supportive local and national organisation.",
  },
];

export const Volunteer = () => {
  const navigate = useNavigate();

  const [selectedRoute, setSelectedRoute] = useState("ci");
  const [selectedArea, setSelectedArea] = useState("training");

  const activeRoute =
    SERVICE_ROUTES.find((route) => route.id === selectedRoute) ||
    SERVICE_ROUTES[2];

  const activeArea =
    SPECIALIST_AREAS.find((area) => area.id === selectedArea) ||
    SPECIALIST_AREAS[0];

  const ActiveRouteIcon = activeRoute.icon;
  const ActiveAreaIcon = activeArea.icon;

  const goToVolunteerEnquiry = () => {
    navigate("/join", {
      state: {
        enquiryType:
          selectedRoute === "committee"
            ? "Civilian Committee Enquiry"
            : "Adult Volunteer Enquiry",
        volunteerRoute: activeRoute.title,
        volunteerInterest: activeArea.title,
      },
    });
  };

  return (
    <section
      id="volunteer"
      data-testid="volunteer-section"
      className="relative overflow-hidden bg-raf-sky py-20 md:py-28"
    >
      <Roundel className="absolute -left-24 bottom-0 h-80 w-80 opacity-[0.05]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="For adults"
            title="Could you support the next generation?"
            intro="Adult volunteers are essential to the RAF Air Cadets. You do not need to have served in the Armed Forces or have aviation experience. Volunteers support cadet development, help deliver activities, provide specialist skills, assist with administration, support events and contribute to the life of the squadron."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 max-w-4xl space-y-4 text-raf-slate leading-relaxed">
            <p>
              New adult volunteers complete an induction and training before
              taking on responsibilities. This helps new staff understand the
              organisation, its training, welfare, safeguarding, culture and the
              development expected of volunteers over time.
            </p>

            <p className="font-semibold text-raf-navy">
              It is a fantastic opportunity to help shape the lives,
              aspirations and experiences of local young people while
              developing valuable skills of your own.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {VOLUNTEER_ROLES.map((role, i) => (
            <Reveal key={role.title} delay={(i % 3) * 0.07}>
              <div
                data-testid={`volunteer-role-${i}`}
                className="group h-full border border-white bg-white p-7 transition-colors hover:border-raf-blue"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-raf-navy text-white transition-colors group-hover:bg-raf-red">
                    <role.icon size={22} />
                  </div>

                  <h3 className="font-display text-lg font-bold text-raf-navy">
                    {role.title}
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-raf-slate">
                  {role.text}
                </p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.14}>
            <div className="flex h-full flex-col justify-between bg-raf-blue p-7">
              <div>
                <p className="font-display text-xl font-bold leading-snug text-white">
                  Bring your skills. Discover new ones. Make a real difference
                  locally.
                </p>

                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  There are uniformed, non-uniformed and committee roles
                  available. We can help you find the route that best suits your
                  interests, experience and availability.
                </p>
              </div>

              <button
                data-testid="volunteer-cta"
                onClick={() =>
                  navigate("/join", {
                    state: {
                      enquiryType: "Adult Volunteer Enquiry",
                    },
                  })
                }
                className="mt-6 inline-flex items-center justify-center gap-2 bg-raf-red px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#A00926]"
              >
                Become an Adult Volunteer
                <ArrowRight size={18} />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Role finder */}
        <Reveal>
          <div className="mt-20 border border-raf-navy/10 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-raf-navy p-8 text-white md:p-10 lg:p-12">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-raf-sky">
                  Volunteer role finder
                </p>

                <h3 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                  Find your place on the squadron
                </h3>

                <p className="mt-5 max-w-xl leading-relaxed text-white/80">
                  There is no single type of RAF Air Cadets volunteer. Choose
                  the route and area that most interests you to explore where
                  you could contribute.
                </p>

                <div className="mt-8 border-l-2 border-raf-red pl-5">
                  <p className="font-semibold text-white">
                    You do not need to arrive with every qualification.
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Enthusiasm, reliability and a commitment to helping young
                    people are an excellent starting point. Training and
                    development continue throughout your service.
                  </p>
                </div>
              </div>

              <div className="p-7 md:p-10 lg:p-12">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-raf-red">
                    Step 1
                  </p>

                  <h4 className="mt-2 font-display text-2xl font-bold text-raf-navy">
                    Which route sounds most like you?
                  </h4>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {SERVICE_ROUTES.map((route) => {
                      const RouteIcon = route.icon;
                      const isActive = selectedRoute === route.id;

                      return (
                        <button
                          key={route.id}
                          type="button"
                          onClick={() => setSelectedRoute(route.id)}
                          className={`flex items-center gap-4 border p-4 text-left transition-all ${
                            isActive
                              ? "border-raf-blue bg-raf-sky ring-1 ring-raf-blue"
                              : "border-raf-navy/10 bg-white hover:border-raf-blue/50"
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center ${
                              isActive
                                ? "bg-raf-blue text-white"
                                : "bg-raf-navy/5 text-raf-navy"
                            }`}
                          >
                            <RouteIcon size={21} />
                          </div>

                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wide text-raf-red">
                              {route.eyebrow}
                            </span>

                            <span className="mt-1 block font-semibold text-raf-navy">
                              {route.shortTitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedRoute !== "committee" && (
                  <div className="mt-10">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-raf-red">
                      Step 2
                    </p>

                    <h4 className="mt-2 font-display text-2xl font-bold text-raf-navy">
                      What would you most like to support?
                    </h4>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {SPECIALIST_AREAS.map((area) => {
                        const AreaIcon = area.icon;
                        const isActive = selectedArea === area.id;

                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => setSelectedArea(area.id)}
                            className={`inline-flex items-center gap-2 border px-4 py-3 text-sm font-semibold transition-colors ${
                              isActive
                                ? "border-raf-blue bg-raf-blue text-white"
                                : "border-raf-navy/10 bg-white text-raf-navy hover:border-raf-blue"
                            }`}
                          >
                            <AreaIcon size={17} />
                            {area.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-10 bg-raf-sky p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-raf-navy text-white">
                      <ActiveRouteIcon size={25} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-raf-red">
                        Your suggested pathway
                      </p>

                      <h4 className="mt-1 font-display text-2xl font-bold text-raf-navy">
                        {activeRoute.title}
                      </h4>
                    </div>
                  </div>

                  <p className="mt-5 leading-relaxed text-raf-slate">
                    {activeRoute.summary}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-raf-slate">
                    {activeRoute.details}
                  </p>

                  <div className="mt-6">
                    <p className="font-semibold text-raf-navy">
                      This route may suit someone interested in:
                    </p>

                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {activeRoute.goodFor.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-raf-slate"
                        >
                          <ChevronRight
                            size={16}
                            className="mt-0.5 shrink-0 text-raf-red"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedRoute !== "committee" && (
                    <div className="mt-7 border-t border-raf-navy/10 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-white text-raf-blue">
                          <ActiveAreaIcon size={19} />
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-raf-red">
                            Potential area of responsibility
                          </p>

                          <p className="font-semibold text-raf-navy">
                            {activeArea.title}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-raf-slate">
                        {activeArea.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {activeArea.roles.map((role) => (
                          <span
                            key={role}
                            className="border border-raf-blue/15 bg-white px-3 py-2 text-xs font-semibold text-raf-navy"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={goToVolunteerEnquiry}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-raf-red px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#A00926] sm:w-auto"
                  >
                    Enquire about this route
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Squadron appointments */}
        <Reveal>
          <div className="mt-20">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-raf-red">
                More than one way to contribute
              </p>

              <h3 className="mt-3 font-display text-3xl font-bold text-raf-navy md:text-4xl">
                Turn your interests into meaningful responsibility
              </h3>

              <p className="mt-5 leading-relaxed text-raf-slate">
                Many squadron responsibilities can be undertaken by either
                uniformed or non-uniformed CFAVs. Your eventual role will depend
                on your interests, experience, qualifications, training and the
                needs of the squadron.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {SPECIALIST_AREAS.map((area, index) => {
                const AreaIcon = area.icon;

                return (
                  <Reveal key={area.id} delay={(index % 2) * 0.06}>
                    <div className="h-full border border-raf-navy/10 bg-white p-7 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-raf-navy text-white">
                          <AreaIcon size={22} />
                        </div>

                        <div>
                          <h4 className="font-display text-xl font-bold text-raf-navy">
                            {area.title}
                          </h4>

                          <p className="mt-3 text-sm leading-relaxed text-raf-slate">
                            {area.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {area.roles.map((role) => (
                          <span
                            key={role}
                            className="bg-raf-sky px-3 py-2 text-xs font-semibold text-raf-navy"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <p className="mt-6 text-sm italic leading-relaxed text-raf-slate">
              Some activities and appointments require additional
              qualifications, authorisation or specialist training before a
              volunteer can deliver them independently.
            </p>
          </div>
        </Reveal>

        {/* Civilian Committee */}
        <Reveal>
          <div className="mt-20 grid overflow-hidden bg-raf-blue lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-10 lg:p-12">
              <div className="flex h-14 w-14 items-center justify-center bg-white text-raf-blue">
                <Handshake size={27} />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-raf-sky">
                Civilian Committee
              </p>

              <h3 className="mt-3 font-display text-3xl font-bold text-white">
                Support the squadron without becoming a uniformed or
                non-uniformed CFAV
              </h3>

              <p className="mt-5 max-w-3xl leading-relaxed text-white/80">
                The Civilian Committee helps govern and support the squadron.
                Members work largely behind the scenes, but they remain very
                much involved in creating opportunities for cadets.
              </p>

              <p className="mt-4 max-w-3xl leading-relaxed text-white/80">
                The committee supports areas such as fundraising, financial
                oversight, equipment, facilities, community relationships and
                the long-term sustainability of the squadron.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/join", {
                    state: {
                      enquiryType: "Civilian Committee Enquiry",
                    },
                  })
                }
                className="mt-8 inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 font-semibold text-raf-navy transition-colors hover:bg-raf-sky"
              >
                Ask about the Civilian Committee
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 border-t border-white/15 lg:border-l lg:border-t-0">
              {[
                {
                  icon: Target,
                  title: "Fundraising",
                  text: "Help secure resources and opportunities for cadets.",
                },
                {
                  icon: Package,
                  title: "Equipment",
                  text: "Support improvements to facilities and squadron resources.",
                },
                {
                  icon: ShieldCheck,
                  title: "Governance",
                  text: "Provide oversight and help the squadron operate responsibly.",
                },
                {
                  icon: Handshake,
                  title: "Community",
                  text: "Strengthen relationships with local people and organisations.",
                },
              ].map((item, index) => {
                const ItemIcon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`p-6 md:p-8 ${
                      index % 2 === 0 ? "border-r border-white/15" : ""
                    } ${index < 2 ? "border-b border-white/15" : ""}`}
                  >
                    <ItemIcon size={24} className="text-raf-sky" />

                    <h4 className="mt-4 font-display text-lg font-bold text-white">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Development */}
        <Reveal>
          <div className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-raf-red">
                Develop while you volunteer
              </p>

              <h3 className="mt-3 font-display text-3xl font-bold text-raf-navy md:text-4xl">
                Volunteering can support your personal and professional growth
              </h3>

              <p className="mt-5 leading-relaxed text-raf-slate">
                RAF Air Cadets volunteering offers opportunities to build
                recognised knowledge, practical competence and transferable
                experience. Depending on your role, interests and progression,
                development may include leadership, management, instruction,
                first aid, risk assessment and activity-specific qualifications.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {DEVELOPMENT_OPPORTUNITIES.map((opportunity, index) => {
                const OpportunityIcon = opportunity.icon;

                return (
                  <Reveal
                    key={opportunity.title}
                    delay={(index % 3) * 0.06}
                  >
                    <div className="h-full border border-raf-navy/10 bg-white p-7">
                      <div className="flex h-12 w-12 items-center justify-center bg-raf-sky text-raf-blue">
                        <OpportunityIcon size={22} />
                      </div>

                      <h4 className="mt-5 font-display text-lg font-bold text-raf-navy">
                        {opportunity.title}
                      </h4>

                      <p className="mt-3 text-sm leading-relaxed text-raf-slate">
                        {opportunity.text}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal>
          <div className="relative mt-20 overflow-hidden bg-raf-navy px-7 py-12 text-center md:px-12 md:py-16">
            <Roundel className="absolute -right-20 -top-20 h-64 w-64 opacity-[0.06]" />

            <div className="relative mx-auto max-w-3xl">
              <Rocket size={34} className="mx-auto text-raf-sky" />

              <h3 className="mt-5 font-display text-3xl font-bold text-white md:text-4xl">
                Help create experiences young people will remember for life
              </h3>

              <p className="mt-5 leading-relaxed text-white/80">
                Whether you can teach, organise, coach, lead, fundraise, manage
                equipment, build community relationships or simply offer your
                time and enthusiasm, your contribution could make a genuine
                difference to young people in Horwich and the surrounding area.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/join", {
                      state: {
                        enquiryType: "Adult Volunteer Enquiry",
                      },
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 bg-raf-red px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[#A00926]"
                >
                  Start a volunteer enquiry
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("volunteer")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2 border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white hover:text-raf-navy"
                >
                  Explore the roles again
                  <MonitorUp size={18} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};