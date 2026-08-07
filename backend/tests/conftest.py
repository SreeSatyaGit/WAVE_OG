from pathlib import Path
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app
from app.services.run_store import reset_store


@pytest.fixture
def client():
    app.config["TESTING"] = True
    reset_store()
    with app.test_client() as test_client:
        yield test_client
