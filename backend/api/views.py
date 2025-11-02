from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
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


# --- Subscribe endpoint ---
@csrf_exempt
def subscribe(request):
    if request.method == "POST":
        data = get_data(request)
        email = data.get("email", "").strip()

        # Basic email validation
        if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return JsonResponse({"error": "Invalid or missing email."}, status=400)

        # Check for duplicates
        if Subscriber.objects.filter(email=email).exists():
            return JsonResponse({"message": "You are already subscribed."})

        # Save to database
        Subscriber.objects.create(email=email, subscribed_at=timezone.now())

        return JsonResponse({"message": f"{email} subscribed successfully!"}, status=201)

    return HttpResponse("Subscription API is active. Use POST with 'email'.")


# --- Contact endpoint ---
@csrf_exempt
def contact(request):
    if request.method == "POST":
        data = get_data(request)
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        message = data.get("message", "").strip()

        # Validate required fields
        if not all([name, email, message]):
            return JsonResponse({"error": "All fields (name, email, message) are required."}, status=400)

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return JsonResponse({"error": "Invalid email format."}, status=400)

        # Save to database
        ContactMessage.objects.create(
            name=name,
            email=email,
            message=message,
            created_at=timezone.now()
        )

        return JsonResponse({
            "status": "success",
            "message": f"Thank you {name}, your message has been received!"
        }, status=201)

    return HttpResponse("Contact API is active. Use POST with name, email, message.")
