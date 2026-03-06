from agents.orchestration_agent import AgentState, OrchestrationAgent, PromptEnvelope


def test_build_prompt_separates_layers_and_context() -> None:
    agent = OrchestrationAgent()
    built = agent.build_prompt(
        PromptEnvelope(
            base_prompt="Never violate safety policy.",
            task_prompt="Summarize architecture.",
            context={"repo": "agent-starter-pack", "target": "mcp"},
        )
    )

    assert "[BASE MODEL PROMPT]" in built
    assert "[TASK PROMPT]" in built
    assert "Never violate safety policy." in built
    assert "Summarize architecture." in built
    assert "- repo: agent-starter-pack" in built
    assert "- target: mcp" in built


def test_happy_path_reaches_completed() -> None:
    agent = OrchestrationAgent()
    final_state = agent.run_happy_path()

    assert final_state == AgentState.COMPLETED
    assert len(agent.history) == 5
    assert agent.history[0].from_state == AgentState.IDLE
    assert agent.history[-1].to_state == AgentState.COMPLETED


def test_invalid_transition_raises_value_error() -> None:
    agent = OrchestrationAgent()

    try:
        agent.transition(AgentState.EXECUTING, "skip steps")
        raise AssertionError("Expected ValueError")
    except ValueError as exc:
        assert "Invalid transition" in str(exc)
