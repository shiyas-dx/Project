from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.conf import settings
from .models import *
from .serializers import *
from django.core.mail import send_mail
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save() 

    
        send_mail(
            subject="Welcome to Cortex Store 🎉",
            message=(
                f"Hi {user.username},\n\n"
                "Your account has been successfully created.\n"
                "We’re excited to have you with us!\n\n"
                "– Cortex Store Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except:
            user = None

        if user:
            if user.is_active:
                return Response(
                    {"message": "Account already activated"},
                    status=status.HTTP_200_OK
                )

            if email_verification_token.check_token(user, token):
                user.is_active = True
                user.save()
                return Response(
                    {"message": "Account activated successfully"},
                    status=status.HTTP_200_OK
                )

        return Response(
            {"error": "Invalid or expired activation link"},
            status=status.HTTP_400_BAD_REQUEST
        )





