from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import AdminUserSerializer
from orders.models import Order
from orders.serializers import OrderSerializer


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by("-id")
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserBlockToggleView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.id == target_user.id:
            return Response(
                {"detail": "You cannot block yourself."},
                status=status.HTTP_403_FORBIDDEN
            )

        if target_user.is_superuser:
            return Response(
                {"detail": "You cannot block a Superuser."},
                status=status.HTTP_403_FORBIDDEN
            )

        target_user.is_active = not target_user.is_active
        target_user.save()

        status_msg = "blocked" if not target_user.is_active else "active"
        
        return Response({
            "id": target_user.id,
            "blocked": not target_user.is_active,
            "detail": f"User is now {status_msg}" 
        })
    

class AdminUserEditView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_superuser:
            return Response(
                {"detail": "You cannot edit a superuser."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data

        
        if "firstname" in data:
            user.first_name = data["firstname"]

        if "username" in data:
            user.username = data["username"]

        if "email" in data:
            user.email = data["email"]

        user.save()

        serializer = AdminUserSerializer(user)

        return Response(serializer.data, status=status.HTTP_200_OK)



class AdminUserOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        orders = Order.objects.filter(user=user).order_by("-id")
        serializer = OrderSerializer(orders, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
