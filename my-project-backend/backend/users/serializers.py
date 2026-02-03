from rest_framework import serializers
from django.contrib.auth.models import User

class AdminUserSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(source="first_name")
    blocked = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "firstname",
            "username",
            "email",
            "blocked",
        ]

    def get_blocked(self, obj):
        return not obj.is_active
