"""Notification agent implementation."""


class NotificationAgent:
    """Handles outbound workflow and status notifications."""

    def role(self) -> str:
        """Return the semantic role for this agent."""
        return "notification"
