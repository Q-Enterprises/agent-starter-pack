# ruff: noqa
# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types
{%- if not cookiecutter.use_google_api_key %}

import os
import google.auth

_, project_id = google.auth.default()
os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
{%- endif %}

INDUSTRY_DATA = {
    "Financial Services": "Banking, Capital Markets, Insurance; leveraging AI for growth, risk reduction, and operational efficiency.",
    "Healthcare & Life Sciences": "Digital transformation through data-powered innovation, advancing R&D, and improving clinician/patient experiences with AI-driven tools.",
    "Retail & Consumer Packaged Goods": "Modernizing commerce, providing Google Search-quality product search, browsing, and recommendations, and digital transformation.",
    "Manufacturing & Automotive": "Optimizing manufacturing operations, accelerating product development, and building connected factories with AI and data platforms.",
    "Media & Entertainment": "Transforming audience experiences, enabling large-scale visual effects rendering, and gen AI-powered creative production.",
    "Telecommunications": "Deploying and monetizing 5G with hybrid and multicloud services.",
    "Government & Public Sector": "Data storage, AI, and analytics solutions for various government agencies, focusing on secure collaboration and innovation.",
    "Education": "Empowering teaching, learning, and research with AI, cloud infrastructure, and data management.",
    "Energy & Utilities": "Multicloud and hybrid solutions, AI, security, and geospatial solutions for sustainable operations.",
    "Gaming": "AI-driven solutions to build and scale games faster, including tools for asset generation pipelines and server orchestration.",
    "Supply Chain & Logistics": "Enabling sustainable, efficient, and resilient data-driven operations.",
}


def get_industry_solutions(industry: str) -> str:
    """Returns the key focus areas for a given industry.

    Args:
        industry: The name of the industry to lookup.

    Returns:
        The key focus areas and details for the industry, or a list of available industries if not found.
    """
    normalized_input = industry.lower()
    # Direct match check
    for key, value in INDUSTRY_DATA.items():
        if key.lower() == normalized_input:
             return f"Key Focus Areas for {key}: {value}"

    # Partial match check
    for key, value in INDUSTRY_DATA.items():
        if normalized_input in key.lower():
             return f"Key Focus Areas for {key}: {value}"

    available = ", ".join(INDUSTRY_DATA.keys())
    return f"Industry '{industry}' not found. Available industries: {available}"


root_agent = Agent(
    name="industry_solutions_agent",
    model=Gemini(
        model="gemini-3-flash-preview",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction="""Google Cloud offers a wide range of solutions tailored to various industries, designed to help businesses improve efficiency, agility, reduce costs, and explore new opportunities.

To help me discover the most relevant solutions for you, please tell me which industry you are interested in.

When the user provides an industry, use the `get_industry_solutions` tool to retrieve the Key Focus Areas and provide them to the user.
If the user asks about other topics, politely guide them back to selecting an industry.""",
    tools=[get_industry_solutions],
)

app = App(root_agent=root_agent, name="{{cookiecutter.agent_directory}}")
