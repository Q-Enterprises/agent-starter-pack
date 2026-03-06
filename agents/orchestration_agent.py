"""State-machine orchestration agent utilities.

This module models a lightweight, deterministic orchestration layer that separates:
1) base-model control prompts (stable safety + policy instructions), and
2) task prompts (dynamic, per-request instructions and context).

It is intentionally dependency-light so it can be reused in local sandboxes,
MCP-style routers, and test harnesses.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, ClassVar


class AgentState(Enum):
    """Finite states for orchestration lifecycle."""

    IDLE = "IDLE"
    PLANNING = "PLANNING"
    TOOL_ROUTING = "TOOL_ROUTING"
    EXECUTING = "EXECUTING"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


@dataclass(frozen=True)
class PromptEnvelope:
    """Normalized prompt payload with explicit layer separation."""

    base_prompt: str
    task_prompt: str
    context: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class TransitionEvent:
    """Record of a state transition in the orchestration timeline."""

    from_state: AgentState
    to_state: AgentState
    reason: str


class OrchestrationAgent:
    """Deterministic state machine for model + tool orchestration."""

    _ALLOWED: ClassVar[dict[AgentState, set[AgentState]]] = {
        AgentState.IDLE: {AgentState.PLANNING, AgentState.FAILED},
        AgentState.PLANNING: {AgentState.TOOL_ROUTING, AgentState.FAILED},
        AgentState.TOOL_ROUTING: {AgentState.EXECUTING, AgentState.FAILED},
        AgentState.EXECUTING: {AgentState.VALIDATING, AgentState.FAILED},
        AgentState.VALIDATING: {AgentState.COMPLETED, AgentState.FAILED},
        AgentState.COMPLETED: set(),
        AgentState.FAILED: set(),
    }

    def __init__(self) -> None:
        self.state: AgentState = AgentState.IDLE
        self._history: list[TransitionEvent] = []

    @property
    def history(self) -> tuple[TransitionEvent, ...]:
        """Immutable view of the transition history."""
        return tuple(self._history)

    def build_prompt(self, envelope: PromptEnvelope) -> str:
        """Build final prompt text while preserving layered boundaries."""
        context_lines = "\n".join(
            f"- {key}: {value}" for key, value in sorted(envelope.context.items())
        )
        context_block = f"\nContext:\n{context_lines}" if context_lines else ""

        return (
            "[BASE MODEL PROMPT]\n"
            f"{envelope.base_prompt}\n\n"
            "[TASK PROMPT]\n"
            f"{envelope.task_prompt}"
            f"{context_block}"
        )

    def transition(self, to_state: AgentState, reason: str) -> None:
        """Move to another state if transition is valid."""
        allowed_targets = self._ALLOWED[self.state]
        if to_state not in allowed_targets:
            raise ValueError(
                f"Invalid transition: {self.state.value} -> {to_state.value}. "
                f"Allowed: {[s.value for s in sorted(allowed_targets, key=lambda s: s.value)]}"
            )

        event = TransitionEvent(from_state=self.state, to_state=to_state, reason=reason)
        self._history.append(event)
        self.state = to_state

    def run_happy_path(self) -> AgentState:
        """Execute a standard non-error lifecycle and return final state."""
        self.transition(AgentState.PLANNING, "task accepted")
        self.transition(AgentState.TOOL_ROUTING, "tools selected")
        self.transition(AgentState.EXECUTING, "execution started")
        self.transition(AgentState.VALIDATING, "result checks")
        self.transition(AgentState.COMPLETED, "validation passed")
        return self.state
