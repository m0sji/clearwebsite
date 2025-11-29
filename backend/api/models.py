from django.db import models

class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=16,
        choices=[
            ("pending", "Pending"),
            ("active", "Active"),
            ("unsubscribed", "Unsubscribed"),
        ],
        default="active",
    )
    last_confirmed_at = models.DateTimeField(blank=True, null=True)
    source = models.CharField(max_length=64, blank=True, default="")

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True, default="")
    message = models.TextField()
    context = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    lead_score = models.IntegerField(default=0)
    priority = models.CharField(
        max_length=12,
        choices=[("low", "Low"), ("normal", "Normal"), ("hot", "Hot")],
        default="normal",
    )
