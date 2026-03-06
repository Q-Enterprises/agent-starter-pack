from __future__ import annotations

from collections.abc import Sequence

import pytest

from agent_starter_pack.runtime.kinetic_resolver import (
    AuditLedger,
    ExpertProfile,
    KineticResolver,
    TaskOntology,
    VectorStore,
)


class RecordingLedger(AuditLedger):
    def __init__(self) -> None:
        self.entries: list[tuple[TaskOntology, str, float | None]] = []

    def record(self, task: TaskOntology, verdict: str, energy_cost: float | None) -> None:
        self.entries.append((task, verdict, energy_cost))


@pytest.mark.parametrize(
    "registration_order",
    [
        ["high_drift", "medium_drift", "low_drift"],
        ["low_drift", "high_drift", "medium_drift"],
    ],
)
def test_resolve_and_execute_selects_lowest_drift_within_budget(
    registration_order: Sequence[str],
) -> None:
    task = TaskOntology(intent="route", required_capabilities=["test"], energy_budget=1.0)
    current_state = [1.0, 2.0, 3.0]
    ledger = RecordingLedger()
    resolver = KineticResolver(
        vector_store=VectorStore(
            [
                ExpertProfile(expert_id="low_drift", weights=[1.0, 1.0, 1.0]),
                ExpertProfile(expert_id="medium_drift", weights=[1.0, -1.0, 1.0]),
                ExpertProfile(expert_id="high_drift", weights=[-1.0, -1.0, -1.0]),
            ]
        ),
        audit_ledger=ledger,
    )

    called: list[str] = []

    def build_expert(expert_id: str):
        def _expert(_task: TaskOntology) -> dict:
            called.append(expert_id)
            return {"selected": expert_id}

        return _expert

    for expert_id in registration_order:
        resolver.register_expert(expert_id, build_expert(expert_id))

    result = resolver.resolve_and_execute(task, current_state)

    assert result == {"selected": "low_drift"}
    assert called == ["low_drift"]
    assert ledger.entries[-1][1] == "SUCCESS"
    assert ledger.entries[-1][2] == pytest.approx(0.0)
