from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ContactMessageSerializer

@method_decorator(csrf_exempt, name='dispatch')
class ContactCreateView(APIView):
    """
    Simple endpoint to create a contact message.
    Note: csrf_exempt used for simplicity in local/dev. Replace with proper CSRF handling in prod.
    """
    def post(self, request, *args, **kwargs):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # optionally: send an email here using Django's send_mail
            return Response({"detail": "Message received"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
