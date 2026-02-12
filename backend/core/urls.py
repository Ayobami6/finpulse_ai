from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LogEntryViewSet,
    ChatEntryViewSet,
    IssueClusterViewSet,
    ActionRecommendationViewSet,
    TeamMemberViewSet,
    DashboardViewSet,
)

router = DefaultRouter()
router.register(r"logs", LogEntryViewSet)
router.register(r"chats", ChatEntryViewSet)
router.register(r"clusters", IssueClusterViewSet)
router.register(r"actions", ActionRecommendationViewSet)
router.register(r"team", TeamMemberViewSet)
router.register(r"dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = [
    path("", include(router.urls)),
]
