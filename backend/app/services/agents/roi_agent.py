from crewai import Agent
from langchain_groq import ChatGroq

def create_roi_agent(llm):
    return Agent(
        role="ROI Prediction Analyst",
        goal="Forecast separate performance metrics based on the generated strategy.",
        backstory="""You are a data scientist. You predict the future performance of marketing strategies.
        You use benchmarks and the quality of the strategy to estimate traffic, engagement, and growth.
        You are realistic but optimistic if the strategy is strong.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )
