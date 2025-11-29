from django.contrib import admin
from .models import Subscriber, ContactMessage


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "status", "source", "created_at", "last_confirmed_at")
    list_filter = ("status", "source", "created_at")
    search_fields = ("email",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "priority", "lead_score", "created_at")
    list_filter = ("priority", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("context",)
