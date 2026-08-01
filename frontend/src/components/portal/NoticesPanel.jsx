import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { api, ROLE_LABELS } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  BellRing,
  Check,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

const AUDIENCES = ["cadet", "parent", "cfav"];

const INITIAL_FORM = {
  title: "",
  body: "",
  roles: ["cadet"],
  requires_ack: false,
};

export const NoticesPanel = ({ canManage }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/notices");
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Could not load squadron notices."
      );
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleRole = (role) => {
    setForm((current) => {
      const roleIsSelected = current.roles.includes(role);

      return {
        ...current,
        roles: roleIsSelected
          ? current.roles.filter(
              (selectedRole) => selectedRole !== role
            )
          : [...current.roles, role],
      };
    });
  };

  const handleDialogChange = (isOpen) => {
    if (busy) return;

    setOpen(isOpen);

    if (!isOpen) {
      setForm(INITIAL_FORM);
    }
  };

  const create = async () => {
    const title = form.title.trim();
    const body = form.body.trim();

    if (!title || !body || form.roles.length === 0) {
      toast.error(
        "Title, message and at least one audience are required."
      );
      return;
    }

    setBusy(true);

    try {
      await api.post("/notices", {
        ...form,
        title,
        body,
      });

      toast.success("Notice posted.");
      setOpen(false);
      setForm(INITIAL_FORM);
      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Could not post notice."
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    const confirmed = window.confirm(
      "Delete this notice? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await api.delete(`/notices/${id}`);

      setNotices((currentNotices) =>
        currentNotices.filter((notice) => notice.id !== id)
      );

      toast.success("Notice deleted.");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Could not delete notice."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleLabel = (role) =>
    ROLE_LABELS?.[role] || role;

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const inputClassName =
    "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue focus:ring-1 focus:ring-raf-blue text-sm disabled:opacity-60";

  return (
    <div>
      <PanelHeading
        title="Notices"
        intro={
          canManage
            ? "Post squadron notices to cadets, parents or staff."
            : "Squadron announcements and updates."
        }
        action={
          canManage ? (
            <button
              data-testid="new-notice-button"
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors"
            >
              <Plus size={18} aria-hidden="true" />
              New notice
            </button>
          ) : null
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center">
          <Loader2
            className="animate-spin"
            aria-hidden="true"
          />
          <span>Loading notices...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white">
          No notices yet.
        </div>
      ) : (
        <div
          className="space-y-3"
          data-testid="notices-list"
        >
          {notices.map((notice) => {
            const isDeleting = deletingId === notice.id;
            const roles = Array.isArray(notice.roles)
              ? notice.roles
              : [];

            return (
              <article
                key={notice.id}
                data-testid={`notice-${notice.id}`}
                className="bg-white border border-white p-5 border-l-4 border-l-raf-blue"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <BellRing
                      size={16}
                      className="text-raf-blue mt-0.5 shrink-0"
                      aria-hidden="true"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-raf-navy break-words">
                          {notice.title}
                        </h3>

                        {notice.requires_ack && (
                          <span className="text-[10px] uppercase bg-raf-red text-white px-2 py-0.5">
                            Must read
                          </span>
                        )}

                        {!canManage &&
                          notice.acknowledged && (
                            <span className="text-[10px] uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 inline-flex items-center gap-1">
                              <Check
                                size={10}
                                aria-hidden="true"
                              />
                              Read
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      data-testid={`delete-notice-${notice.id}`}
                      type="button"
                      onClick={() => remove(notice.id)}
                      disabled={
                        isDeleting || deletingId !== null
                      }
                      aria-label={`Delete notice: ${notice.title}`}
                      className="text-raf-slate hover:text-raf-red disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isDeleting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2
                          size={16}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-2 text-raf-slate leading-relaxed whitespace-pre-line text-sm break-words">
                  {notice.body}
                </p>

                <div className="mt-3 text-xs text-raf-slate flex flex-wrap gap-2">
                  <span>
                    {formatDate(notice.created_at)}
                  </span>

                  {canManage && roles.length > 0 && (
                    <>
                      <span aria-hidden="true">
                        &middot;
                      </span>

                      <span>
                        To:{" "}
                        {roles
                          .map(getRoleLabel)
                          .join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {canManage && (
        <Dialog
          open={open}
          onOpenChange={handleDialogChange}
        >
          <DialogContent
            data-testid="notice-form"
            className="max-w-lg rounded-none"
          >
            <DialogHeader>
              <DialogTitle className="font-display text-raf-navy">
                New notice
              </DialogTitle>

              <DialogDescription>
                Create a squadron notice and select which
                portal users should receive it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="notice-title"
                  className="block text-xs text-raf-slate mb-1.5"
                >
                  Notice title
                </label>

                <input
                  id="notice-title"
                  data-testid="notice-title"
                  className={inputClassName}
                  type="text"
                  placeholder="Enter a clear notice title"
                  value={form.title}
                  disabled={busy}
                  maxLength={150}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value
                    )
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="notice-body"
                  className="block text-xs text-raf-slate mb-1.5"
                >
                  Message
                </label>

                <textarea
                  id="notice-body"
                  data-testid="notice-body"
                  className={inputClassName}
                  rows={5}
                  placeholder="Enter the notice message"
                  value={form.body}
                  disabled={busy}
                  onChange={(event) =>
                    updateForm(
                      "body",
                      event.target.value
                    )
                  }
                />
              </div>

              <fieldset>
                <legend className="text-xs text-raf-slate mb-2">
                  Audience
                </legend>

                <div className="flex gap-2 flex-wrap">
                  {AUDIENCES.map((role) => {
                    const isSelected =
                      form.roles.includes(role);

                    return (
                      <button
                        key={role}
                        data-testid={`audience-${role}`}
                        type="button"
                        disabled={busy}
                        aria-pressed={isSelected}
                        onClick={() =>
                          toggleRole(role)
                        }
                        className={`px-3 py-1.5 text-sm border transition-colors disabled:opacity-60 ${
                          isSelected
                            ? "bg-raf-blue text-white border-raf-blue"
                            : "bg-white text-raf-slate border-raf-sky hover:border-raf-blue"
                        }`}
                      >
                        {getRoleLabel(role)}
                      </button>
                    );
                  })}
                </div>

                {form.roles.length === 0 && (
                  <p className="mt-2 text-xs text-raf-red">
                    Select at least one audience.
                  </p>
                )}
              </fieldset>

              <label className="flex items-start gap-2 text-sm text-raf-slate cursor-pointer">
                <input
                  data-testid="notice-requires-ack"
                  type="checkbox"
                  checked={form.requires_ack}
                  disabled={busy}
                  onChange={(event) =>
                    updateForm(
                      "requires_ack",
                      event.target.checked
                    )
                  }
                  className="w-4 h-4 mt-0.5 accent-raf-blue"
                />

                <span>
                  Require acknowledgement at the user's
                  next sign-in
                </span>
              </label>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() =>
                  handleDialogChange(false)
                }
                disabled={busy}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-raf-sky text-raf-slate font-semibold hover:border-raf-blue hover:text-raf-blue transition-colors disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                data-testid="notice-submit"
                type="button"
                onClick={create}
                disabled={
                  busy ||
                  !form.title.trim() ||
                  !form.body.trim() ||
                  form.roles.length === 0
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-raf-blue text-white font-semibold hover:bg-raf-navy transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy && (
                  <Loader2
                    className="animate-spin"
                    size={16}
                    aria-hidden="true"
                  />
                )}

                {busy ? "Posting..." : "Post notice"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};