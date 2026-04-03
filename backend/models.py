from pydantic import BaseModel
from typing import List

class DatasetRequirements(BaseModel):
    source: str
    type: List[str]
    min_rows: int
    max_rows: int
    features: str
    labels_required: bool

class Questionnaire(BaseModel):
    task: str
    domain: str
    output_type: str
    algo_type: str
    dataset: DatasetRequirements

class DatasetSelection(BaseModel):
    name: str
    ref: str
    source: str
    usability: float
    votes: int
    downloads: int
def resolve_algorithm(preferred_algorithm, task, dataset_info):
    rows = dataset_info["rows"]

    # AUTO (BEST)
    if preferred_algorithm == "auto":
        if task == "regression" and rows < 100_000:
            return "linear_regression"
        if task == "classification" and rows < 50_000:
            return "random_forest"
        return "xgboost"

    # NEURAL NETWORK GUARD
    if preferred_algorithm == "neural-network":
        if rows < 10_000:
            raise ValueError("Dataset too small for Neural Network")
        return "mlp"

    # MANUAL FAMILIES
    family = ALGORITHM_FAMILIES.get(preferred_algorithm)
    if not family:
        raise ValueError("Invalid algorithm choice")

    return family[0]  # pick safe default
