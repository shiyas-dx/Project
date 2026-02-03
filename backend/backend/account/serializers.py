from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate
from django.db import transaction
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from .token import email_verification_token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
            "confirm_password",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")

        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError("Username already exists")

        # if User.objects.filter(email=data["email"]).exists():
        #     raise serializers.ValidationError("Email already exists")

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    first_name=validated_data["first_name"],
                    last_name=validated_data["last_name"],
                    username=validated_data["username"],
                    email=validated_data["email"],
                    password=validated_data["password"],
                    is_active=False,
                )

                self.send_verification_email(user)

                return user

        except Exception as e:
            raise serializers.ValidationError("Registration failed. Please try again.")

    def send_verification_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token.make_token(user)

        activation_link = f"http://localhost:5173/activate/{uid}/{token}/"

        subject = "Activate your account"
        message = f"""
Hi {user.first_name},

Please click the link below to activate your account:

{activation_link}

If you didn't register, ignore this email.
"""

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")


        if "@" in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                username_or_email = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")

        user = authenticate(username=username_or_email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid credentials")


        data = super().validate({
            "username": user.username,
            "password": password
        })

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }

        return data