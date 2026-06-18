import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { JOIN_PATHWAYS, ENQUIRY_TYPES } from "../../data/content";
import { Reveal, SectionHeading } from "./Reveal";
import { goToJoin } from "../../utils/nav";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyForm = {
  name: "", email: "", phone: "",
  enquiry_type: "Join as a Cadet", message: "", consent: false,
};

export const Join = () => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handler = (e) =>
      setForm((f) => ({ ...f, enquiry_type: e.detail }));
    window.addEventListener("set-enquiry", handler);
    return () => window.removeEventListener("set-enquiry", handler);
  }, []);

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = "Enter a valid email address.";
    if (form.message.trim().length < 5) er.message = "Please add a short message.";
    if (!form.consent) er.consent = "Please tick the consent box to continue.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/enquiries`, form);
      toast.success("Thank you \u2014 your enquiry has been sent.", {
        description: "A member of the squadron team will be in touch.",
      });
      setForm({ ...emptyForm, enquiry_type: form.enquiry_type });
      setErrors({});
    } catch (err) {
      toast.error("Sorry, something went wrong.", {
        description: "Please try again, or contact us via Facebook.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <section id="join" data-testid="join-section" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <Reveal>
          <SectionHeading
            center
            eyebrow="Get involved"
            title="Join 1471 Horwich Squadron"
            intro="Choose the pathway that fits you and send us a quick enquiry. There&rsquo;s no commitment in getting in touch."
          />
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {JOIN_PATHWAYS.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.08}>
              <button
                data-testid={`join-pathway-${i}`}
                onClick={() => goToJoin(p.key)}
                className={`group w-full text-left h-full p-7 border transition-all ${
                  form.enquiry_type === p.key
                    ? "bg-raf-blue border-raf-blue"
                    : "bg-raf-sky/50 border-raf-sky hover:border-raf-blue"
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center ${
                  form.enquiry_type === p.key ? "bg-raf-red text-white" : "bg-white text-raf-blue"
                }`}>
                  <p.icon size={22} />
                </div>
                <h3 className={`mt-5 font-display text-lg font-bold ${
                  form.enquiry_type === p.key ? "text-white" : "text-raf-navy"
                }`}>
                  {p.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${
                  form.enquiry_type === p.key ? "text-white/85" : "text-raf-slate"
                }`}>
                  {p.text}
                </p>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <form
            data-testid="enquiry-form"
            onSubmit={submit}
            className="mt-10 max-w-3xl mx-auto bg-white border border-raf-sky p-7 md:p-10"
            noValidate
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-raf-navy mb-2">Name</label>
                <input
                  data-testid="form-name"
                  value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  className="w-full border border-raf-sky px-4 py-3 outline-none focus:border-raf-blue focus:ring-1 focus:ring-raf-blue"
                  placeholder="Your full name"
                />
                {errors.name && <p data-testid="error-name" className="text-raf-red text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-raf-navy mb-2">Email</label>
                <input
                  data-testid="form-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => field("email", e.target.value)}
                  className="w-full border border-raf-sky px-4 py-3 outline-none focus:border-raf-blue focus:ring-1 focus:ring-raf-blue"
                  placeholder="you@example.com"
                />
                {errors.email && <p data-testid="error-email" className="text-raf-red text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-raf-navy mb-2">Phone <span className="font-normal text-raf-slate">(optional)</span></label>
                <input
                  data-testid="form-phone"
                  value={form.phone}
                  onChange={(e) => field("phone", e.target.value)}
                  className="w-full border border-raf-sky px-4 py-3 outline-none focus:border-raf-blue focus:ring-1 focus:ring-raf-blue"
                  placeholder="Contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-raf-navy mb-2">Enquiry type</label>
                <Select value={form.enquiry_type} onValueChange={(v) => field("enquiry_type", v)}>
                  <SelectTrigger data-testid="form-enquiry-type" className="w-full border-raf-sky rounded-none py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENQUIRY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} data-testid={`enquiry-option-${t}`}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-raf-navy mb-2">Message</label>
              <textarea
                data-testid="form-message"
                rows={4}
                value={form.message}
                onChange={(e) => field("message", e.target.value)}
                className="w-full border border-raf-sky px-4 py-3 outline-none focus:border-raf-blue focus:ring-1 focus:ring-raf-blue resize-none"
                placeholder="Tell us a little about your enquiry..."
              />
              {errors.message && <p data-testid="error-message" className="text-raf-red text-xs mt-1">{errors.message}</p>}
            </div>

            <label className="mt-5 flex items-start gap-3 cursor-pointer">
              <input
                data-testid="form-consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => field("consent", e.target.checked)}
                className="mt-1 w-5 h-5 accent-raf-blue"
              />
              <span className="text-sm text-raf-slate leading-relaxed">
                I consent to 1471 Horwich Squadron using these details to respond
                to my enquiry.
              </span>
            </label>
            {errors.consent && <p data-testid="error-consent" className="text-raf-red text-xs mt-1">{errors.consent}</p>}

            <button
              data-testid="form-submit"
              type="submit"
              disabled={submitting}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {submitting ? "Sending..." : "Send enquiry"}
            </button>

            <div className="mt-5 flex items-start gap-2 text-xs text-raf-slate">
              <ShieldCheck size={16} className="text-raf-blue shrink-0 mt-0.5" />
              <p>
                This form is a website enquiry form only. Final joining,
                volunteering and participation processes are managed through RAF
                Air Cadets procedures.
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
};
