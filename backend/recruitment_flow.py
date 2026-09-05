"""Recruitment enquiry workflow for prospective 1471 cadets.

This router deliberately separates *eligibility/readiness* from *workflow
progress*.  An enquiry keeps its recruitment category while staff independently
record whether an open-evening invitation, joining instructions and joining
documents have been sent.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

try:  # Package import (e.g. backend.recruitment_flow)
    from . import server_legacy as legacy
except ImportError:  # Script/workdir import (e.g. uvicorn server:app)
    import server_legacy as legacy


recruitment_router = APIRouter(prefix="/api/recruitment", tags=["recruitment"])

RECRUITMENT_CATEGORIES = {
    "uncategorised": "Needs categorising",
    "ready_now": "Ready now",
    "september_2028": "September 2028",
    "not_ready": "Not ready",
}

RECRUITMENT_TARGET_DATES = {
    "september_2028": "2028-09-01",
}


class RecruitmentProgressUpdate(BaseModel):
    recruitment_category: Optional[str] = None
    open_evening_invite_sent: Optional[bool] = None
    joining_instructions_sent: Optional[bool] = None
    joining_documents_sent: Optional[bool] = None
    model_config = ConfigDict(extra="ignore")


class RecruitmentJoiningEmail(BaseModel):
    note: str = Field(default="", max_length=2000)
    attachment_ids: List[str] = []
    base_url: str = ""
    model_config = ConfigDict(extra="ignore")


def _category(e: dict) -> str:
    value = e.get("recruitment_category") or "uncategorised"
    return value if value in RECRUITMENT_CATEGORIES else "uncategorised"


def _sent_at(e: dict, field: str) -> Optional[str]:
    # An explicit field (including None) wins.  This lets staff undo a legacy
    # inferred status without the old email record immediately re-marking it.
    if field in e:
        return e.get(field) or None

    # Preserve useful history from the recruitment email feature that existed
    # before this workflow.  We can reliably infer joining instructions, but we
    # cannot infer whether old emails contained attachments, so documents remain
    # deliberately unmarked until staff confirm them.
    if field == "joining_instructions_sent_at":
        last = e.get("last_recruit_email") or {}
        if last.get("kind") == "joining" and last.get("status") == "sent":
            return last.get("at")
    return None


def _progress_state(e: dict) -> dict:
    category = _category(e)
    invite_at = _sent_at(e, "open_evening_invite_sent_at")
    instructions_at = _sent_at(e, "joining_instructions_sent_at")
    documents_at = _sent_at(e, "joining_documents_sent_at")
    return {
        "recruitment_category": category,
        "recruitment_category_label": RECRUITMENT_CATEGORIES[category],
        "recruitment_target_date": RECRUITMENT_TARGET_DATES.get(category),
        "open_evening_invite_sent_at": invite_at,
        "joining_instructions_sent_at": instructions_at,
        "joining_documents_sent_at": documents_at,
        "progress": {
            "categorised": category != "uncategorised",
            "open_evening_invite_sent": bool(invite_at),
            "joining_instructions_sent": bool(instructions_at),
            "joining_documents_sent": bool(documents_at),
        },
        "recruitment_history": e.get("recruitment_history", []),
    }


def _out(e: dict) -> dict:
    out = legacy._enquiry_out(e)
    out.update(_progress_state(e))
    return out


def _staff_name(staff: dict) -> str:
    return (
        f"{staff.get('first_name', '')} {staff.get('last_name', '')}".strip()
        or staff.get("email", "Staff")
    )


def _history(action: str, staff: dict, **extra) -> dict:
    return {
        "action": action,
        "at": legacy.now_iso(),
        "by": staff.get("id"),
        "by_name": _staff_name(staff),
        **extra,
    }


@recruitment_router.get("/tracker")
async def recruitment_tracker(staff: dict = Depends(legacy.require_privileged_staff)):
    """Return prospective cadets grouped by the staff-controlled category."""
    rows = await legacy.db.enquiries.find(
        {"age_band": {"$ne": None}}, {"_id": 0}
    ).sort("created_at", -1).to_list(2000)

    buckets = {key: [] for key in RECRUITMENT_CATEGORIES}
    all_rows = []
    for e in rows:
        item = _out(e)
        buckets[item["recruitment_category"]].append(item)
        all_rows.append(item)

    actionable = [
        e for e in all_rows
        if e["recruitment_category"] in {"ready_now", "september_2028"}
    ]
    ready_now = [e for e in all_rows if e["recruitment_category"] == "ready_now"]

    action_counts = {
        "needs_categorising": len(buckets["uncategorised"]),
        "needs_open_evening_invite": sum(
            1 for e in actionable if not e["progress"]["open_evening_invite_sent"]
        ),
        "needs_joining_instructions": sum(
            1 for e in ready_now
            if e["progress"]["open_evening_invite_sent"]
            and not e["progress"]["joining_instructions_sent"]
        ),
        "needs_joining_documents": sum(
            1 for e in ready_now
            if e["progress"]["joining_instructions_sent"]
            and not e["progress"]["joining_documents_sent"]
        ),
    }

    return {
        "buckets": buckets,
        "counts": {key: len(value) for key, value in buckets.items()},
        "labels": RECRUITMENT_CATEGORIES,
        "action_counts": action_counts,
        "total": len(all_rows),
    }


@recruitment_router.patch("/enquiries/{enquiry_id}")
async def update_recruitment_progress(
    enquiry_id: str,
    payload: RecruitmentProgressUpdate,
    staff: dict = Depends(legacy.require_privileged_staff),
):
    existing = await legacy.db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    set_fields = {}
    history = []
    now = legacy.now_iso()

    requested_category = (payload.recruitment_category or _category(existing)).strip().lower()
    if requested_category not in RECRUITMENT_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid recruitment category")
    if payload.open_evening_invite_sent is True and requested_category not in {"ready_now", "september_2028"}:
        raise HTTPException(status_code=400, detail="Open-evening invitations can only be recorded for active recruitment categories")
    if payload.joining_instructions_sent is True and requested_category != "ready_now":
        raise HTTPException(status_code=400, detail="Joining instructions can only be recorded for Ready now enquiries")
    if payload.joining_documents_sent is True and requested_category != "ready_now":
        raise HTTPException(status_code=400, detail="Joining documents can only be recorded for Ready now enquiries")

    if payload.recruitment_category is not None:
        category = payload.recruitment_category.strip().lower()
        if category not in RECRUITMENT_CATEGORIES:
            raise HTTPException(status_code=400, detail="Invalid recruitment category")
        if category != _category(existing):
            set_fields["recruitment_category"] = category
            set_fields["recruitment_category_set_at"] = now
            history.append(_history(
                "category_changed",
                staff,
                from_category=_category(existing),
                to_category=category,
            ))

    toggles = [
        (
            "open_evening_invite_sent",
            payload.open_evening_invite_sent,
            "open_evening_invite_sent_at",
            "open_evening_invite_sent",
            "open_evening_invite_cleared",
        ),
        (
            "joining_instructions_sent",
            payload.joining_instructions_sent,
            "joining_instructions_sent_at",
            "joining_instructions_sent",
            "joining_instructions_cleared",
        ),
        (
            "joining_documents_sent",
            payload.joining_documents_sent,
            "joining_documents_sent_at",
            "joining_documents_sent",
            "joining_documents_cleared",
        ),
    ]

    for _, value, field, sent_action, cleared_action in toggles:
        if value is None:
            continue
        new_value = now if value else None
        current = _sent_at(existing, field)
        if bool(current) == bool(value):
            continue
        set_fields[field] = new_value
        history.append(_history(sent_action if value else cleared_action, staff))

    if not set_fields and not history:
        return _out(existing)

    set_fields["recruitment_updated_at"] = now
    set_fields["recruitment_updated_by"] = staff.get("id")

    update_doc = {"$set": set_fields}
    if history:
        update_doc["$push"] = {"recruitment_history": {"$each": history}}

    await legacy.db.enquiries.update_one({"id": enquiry_id}, update_doc)
    updated = await legacy.db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    return _out(updated)


@recruitment_router.post("/enquiries/{enquiry_id}/joining-email")
async def send_joining_email(
    enquiry_id: str,
    payload: RecruitmentJoiningEmail,
    staff: dict = Depends(legacy.require_privileged_staff),
):
    e = await legacy.db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    if _category(e) != "ready_now":
        raise HTTPException(
            status_code=400,
            detail="Joining instructions can only be sent to an enquiry categorised as Ready now.",
        )

    attachments = await legacy._fetch_attachments(payload.attachment_ids)
    result = await legacy.send_recruit_email(
        e,
        "joining",
        payload.note,
        attachments,
        payload.base_url,
    )

    if result.get("email_status") == "sent":
        now = legacy.now_iso()
        set_fields = {
            "joining_instructions_sent_at": now,
            "recruitment_updated_at": now,
            "recruitment_updated_by": staff.get("id"),
        }
        history = [
            _history(
                "joining_instructions_emailed",
                staff,
                attachment_count=len(attachments),
            )
        ]
        if attachments:
            set_fields["joining_documents_sent_at"] = now
            set_fields["joining_document_attachment_ids"] = payload.attachment_ids
            history.append(_history(
                "joining_documents_emailed",
                staff,
                attachment_count=len(attachments),
                attachment_ids=payload.attachment_ids,
            ))
        await legacy.db.enquiries.update_one(
            {"id": enquiry_id},
            {
                "$set": set_fields,
                "$push": {"recruitment_history": {"$each": history}},
            },
        )

    updated = await legacy.db.enquiries.find_one({"id": enquiry_id}, {"_id": 0})
    return {
        **result,
        "documents_sent": bool(attachments) and result.get("email_status") == "sent",
        "enquiry": _out(updated),
    }
