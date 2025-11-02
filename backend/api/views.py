from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Subscriber, ContactMessage
import json

@csrf_exempt
def subscribe(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        if not email:
            return JsonResponse({'error': 'Email required'}, status=400)
        sub, created = Subscriber.objects.get_or_create(email=email)
        return JsonResponse({'success': True, 'created': created})

@csrf_exempt
def contact(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        if not (name and email and message):
            return JsonResponse({'error': 'All fields required'}, status=400)
        ContactMessage.objects.create(name=name, email=email, message=message)
        return JsonResponse({'success': True})
