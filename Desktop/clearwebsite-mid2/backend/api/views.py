from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
from django.core.cache import cache
from django.utils import timezone
from .models import Subscriber, ContactMessage
import json
import re


# --- Helper function to extract data from JSON or POST ---
def get_data(request):
    if request.content_type == "application/json":
        try:
            return json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return {}
    return request.POST


def get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def is_rate_limited(kind, identifier, limit, window_seconds):
    """
    Simple leaky-bucket style rate limiter keyed by kind+identifier.
    Relies on Django cache; if cache is DummyCache it effectively no-ops.
    """
    if not identifier:
        return False
    key = f"api_rate:{kind}:{identifier}"
    bucket = cache.get(key)
    now = timezone.now().timestamp()
    if not bucket:
        bucket = {"count": 0, "start": now}
    # reset bucket if window elapsed
    if now - bucket["start"] > window_seconds:
        bucket = {"count": 0, "start": now}

    bucket["count"] += 1
    cache.set(key, bucket, timeout=window_seconds)
    return bucket["count"] > limit


def compute_lead_score(payload):
    """Heuristic lead scoring based on role, budget, timeline, and intent keywords."""
    score = 0
    text_blocks = []
    for key in ("subject", "message"):
        val = payload.get(key)
        if isinstance(val, str):
            text_blocks.append(val.lower())
    ctx = payload.get("context") or {}
    if isinstance(ctx, dict):
        for val in ctx.values():
            if isinstance(val, str):
                text_blocks.append(val.lower())
            elif isinstance(val, dict):
                text_blocks.extend([str(v).lower() for v in val.values()])

    full_text = " ".join(text_blocks)

    role_keywords = ["cto", "ceo", "founder", "coo", "vp", "director", "lead", "head", "product", "operations"]
    budget_keywords = ["budget", "$", "usd", "eur", "€", "£", "k", "funding"]
    timeline_keywords = ["now", "immediately", "this quarter", "q", "2 weeks", "30 days", "60 days", "soon", "urgent"]
    intent_keywords = ["launch", "deploy", "pilot", "production", "rollout", "quote", "pricing", "proposal", "estimate", "buy"]

    # Role weight
    if any(k in full_text for k in role_keywords):
        score += 10

    # Budget weight
    if any(k in full_text for k in budget_keywords):
        score += 10

    # Timeline weight
    if any(k in full_text for k in timeline_keywords):
        score += 8

    # Intent weight
    score += 2 * sum(1 for k in intent_keywords if k in full_text)

    # Message length as weak signal
    msg_len = len(payload.get("message", "")) if isinstance(payload.get("message"), str) else 0
    if msg_len > 300:
        score += 5
    elif msg_len > 120:
        score += 3

    return score


def classify_priority(score):
    if score >= 30:
        return "hot"
    if score >= 15:
        return "normal"
    return "low"


def send_webhook_notification(payload):
    url = os.getenv("LEAD_WEBHOOK_URL", getattr(settings, "LEAD_WEBHOOK_URL", None))
    if not url:
        return
    try:
        import urllib.request
        import json as jsonlib

        req = urllib.request.Request(
            url,
            data=jsonlib.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception:
        # Silent fail to avoid blocking user flow
        return


# --- Subscribe endpoint ---
@csrf_exempt
def subscribe(request):
    if request.method != "POST":
        return HttpResponse("Subscription API is active. Use POST with 'email'.")

    data = get_data(request)
    email = data.get("email", "").strip().lower()
    source = data.get("source", "").strip()
    ip = get_client_ip(request)

    # Rate limiting: burst limit per IP and slower limit per email
    if is_rate_limited("subscribe_ip", ip, limit=5, window_seconds=60) or is_rate_limited(
        "subscribe_email", email, limit=3, window_seconds=300
    ):
        return JsonResponse(
            {"success": False, "error": "Too many attempts. Please try again later."},
            status=429,
        )

    # Basic email validation
    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return JsonResponse({"success": False, "error": "Invalid or missing email."}, status=400)

    # Check for duplicates
    existing = Subscriber.objects.filter(email=email).first()
    if existing:
        if existing.status == "unsubscribed":
            existing.status = "active"
            existing.last_confirmed_at = timezone.now()
            existing.save(update_fields=["status", "last_confirmed_at"])
            return JsonResponse(
                {"success": True, "message": f"{email} has been reactivated. Welcome back!"},
                status=200,
            )
        return JsonResponse({"success": True, "message": "You are already subscribed."}, status=200)

    # Save to database
    Subscriber.objects.create(
        email=email, status="active", last_confirmed_at=timezone.now(), source=source
    )

    return JsonResponse({"success": True, "message": f"{email} subscribed successfully!"}, status=201)


# --- Contact endpoint ---
@csrf_exempt
def contact(request):
    if request.method != "POST":
        return HttpResponse("Contact API is active. Use POST with name, email, subject, message.")

    data = get_data(request)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()
    ip = get_client_ip(request)

    # Rate limiting: protect against bursts and repeated spam
    if is_rate_limited("contact_ip", ip, limit=5, window_seconds=120) or is_rate_limited(
        "contact_email", email, limit=3, window_seconds=900
    ):
        return JsonResponse(
            {"success": False, "error": "Too many submissions. Please retry in a few minutes."},
            status=429,
        )

    # Validate required fields
    if not all([name, email, message]):
        return JsonResponse(
            {"success": False, "error": "All fields (name, email, message) are required."}, status=400
        )

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return JsonResponse({"success": False, "error": "Invalid email format."}, status=400)

    # Collect optional ROI/estimator/triage context without enforcing shape
    context_fields = {}
    for key in [
        "roi_summary",
        "estimator_summary",
        "triage_summary",
        "matcher_summary",
        "context",
        "source",
    ]:
        value = data.get(key)
        if value in (None, "", []):
            continue
        context_fields[key] = value

    lead_score = compute_lead_score(
        {
            "subject": subject,
            "message": message,
            "context": context_fields,
        }
    )
    priority = classify_priority(lead_score)

    ContactMessage.objects.create(
        name=name,
        email=email,
        subject=subject,
        message=message,
        context=context_fields or None,
        lead_score=lead_score,
        priority=priority,
    )

    if priority == "hot":
        send_webhook_notification(
            {
                "type": "lead_hot",
                "name": name,
                "email": email,
                "subject": subject,
                "message": message[:500],
                "priority": priority,
                "lead_score": lead_score,
                "context": context_fields,
            }
        )

    return JsonResponse(
        {"success": True, "message": f"Thank you {name}, your message has been received!"},
        status=201,
    )
