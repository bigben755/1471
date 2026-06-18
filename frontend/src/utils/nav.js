export function scrollToId(href) {
  const id = href.startsWith("#") ? href.slice(1) : href;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Scrolls to the Join section and pre-selects an enquiry type.
export function goToJoin(enquiryType) {
  scrollToId("join");
  if (enquiryType) {
    window.dispatchEvent(
      new CustomEvent("set-enquiry", { detail: enquiryType })
    );
  }
}
