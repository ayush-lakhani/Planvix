from crewai import Agent
from langchain_groq import ChatGroq

def create_traffic_agent(llm):
    return Agent(
        role="Organic Traffic Architect",
        goal="Extract high-impact keywords and hashtags that drive search traffic.",
        backstory="""You are an SEO wizard for social platforms. You know that content needs to be discoverable.
        You find the specific keywords and hashtags that have high volume but low competition.
        You structure metadata to ensure maximum visibility.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )
