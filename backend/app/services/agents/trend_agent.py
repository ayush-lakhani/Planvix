from crewai import Agent
from langchain_groq import ChatGroq

def create_trend_agent(llm):
    return Agent(
        role="Trend & Competitor Gap Sniper",
        goal="Identify viral opportunities and 'blue ocean' content gaps competitors are missing.",
        backstory="""You live on the cutting edge of culture. You spot trends before they go mainstream.
        You analyze competitors to find their weaknesses—content they are finding boring, 
        questions they aren't answering, and formats they are ignoring.""",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )
