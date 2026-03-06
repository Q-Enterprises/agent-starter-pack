"""Agents module - Agent swarm system for parallel task execution.

Provides specialized agents for research, architecture, coding, and testing.
"""

from agents.managing_agent import ManagingAgent
from agents.orchestration_agent import OrchestrationAgent
from agents.architecture_agent import ArchitectureAgent
from agents.coder import CoderAgent
from agents.tester import TesterAgent
from agents.researcher import ResearcherAgent
from agents.pinn_agent import PINNAgent
from agents.notification_agent import NotificationAgent

__all__ = [
    'ManagingAgent',
    'OrchestrationAgent',
    'ArchitectureAgent',
    'CoderAgent',
    'TesterAgent',
    'ResearcherAgent',
    'PINNAgent',
    'NotificationAgent',
]
