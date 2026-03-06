"""Tests for the top-level agents package exports."""

from agents import (
    ArchitectureAgent,
    CoderAgent,
    ManagingAgent,
    NotificationAgent,
    OrchestrationAgent,
    PINNAgent,
    ResearcherAgent,
    TesterAgent,
)


def test_agents_public_exports_are_importable() -> None:
    """All package-level exports resolve to constructible classes."""
    assert ManagingAgent().__class__.__name__ == "ManagingAgent"
    assert OrchestrationAgent().__class__.__name__ == "OrchestrationAgent"
    assert ArchitectureAgent().__class__.__name__ == "ArchitectureAgent"
    assert CoderAgent().__class__.__name__ == "CoderAgent"
    assert TesterAgent().__class__.__name__ == "TesterAgent"
    assert ResearcherAgent().__class__.__name__ == "ResearcherAgent"
    assert PINNAgent().__class__.__name__ == "PINNAgent"
    assert NotificationAgent().__class__.__name__ == "NotificationAgent"


def test_specialized_agent_roles() -> None:
    """Specialized role methods return expected role identifiers."""
    assert ManagingAgent().role() == "manager"
    assert ArchitectureAgent().role() == "architecture"
    assert CoderAgent().role() == "coder"
    assert TesterAgent().role() == "tester"
    assert ResearcherAgent().role() == "researcher"
    assert PINNAgent().role() == "pinn"
    assert NotificationAgent().role() == "notification"
