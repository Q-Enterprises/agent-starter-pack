import math

import numpy as np

from init_runtime import KernelControlToken, KineticTaskRouter


def _build_router() -> KineticTaskRouter:
    return KineticTaskRouter(
        KernelControlToken(
            session_id="TEST_SESSION",
            entropy_budget=0.05,
            physics_tags={"gravity": 1.0},
        )
    )


def test_calculate_drift_returns_fallback_for_zero_and_near_zero_vectors() -> None:
    router = _build_router()

    zero = np.zeros(3)
    normal = np.array([1.0, 2.0, 3.0])
    near_zero = np.array([1e-320, -1e-320, 0.0])

    zero_drift = router._calculate_drift(zero, normal)
    near_zero_drift = router._calculate_drift(near_zero, normal)

    assert zero_drift == 1.0
    assert near_zero_drift == 1.0

    assert math.isfinite(zero_drift)
    assert math.isfinite(near_zero_drift)


def test_calculate_drift_remains_finite_for_tiny_nonzero_vectors() -> None:
    router = _build_router()

    tiny_a = np.array([1e-200, 2e-200, -1e-200])
    tiny_b = np.array([2e-200, -1e-200, 3e-200])

    drift = router._calculate_drift(tiny_a, tiny_b)

    assert math.isfinite(drift)
    assert 0.0 <= drift <= 2.0
