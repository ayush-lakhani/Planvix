from enum import Enum
from typing import Optional, List
from crewai import LLM
from app.core.config import settings
from app.core.logger import logger
import time

class AIModel(str, Enum):
    GROQ_LLAMA_70B = "groq/llama-3.3-70b-versatile"
    OPENAI_GPT4O = "openai/gpt-4o"
    OPENAI_GPT4O_MINI = "openai/gpt-4o-mini"

class AIProviderFactory:
    """
    Enterprise AI Provider Factory with failover support.
    Manages LLM instances and provides fallback logic between providers.
    """
    
    @staticmethod
    def get_llm(model_name: Optional[str] = None, temperature: float = 0.5) -> LLM:
        """
        Returns a configured CrewAI LLM instance.
        Defaults to Groq (Llama 3.3 70B) for speed/cost, falls back to OpenAI if configured.
        """
        primary_model = model_name or AIModel.GROQ_LLAMA_70B
        
        # Check if primary provider is available
        if "groq" in primary_model and not settings.GROQ_API_KEY:
            logger.warning("⚠️ Groq API Key missing. Attempting to use OpenAI fallback...")
            if settings.OPENAI_API_KEY:
                primary_model = AIModel.OPENAI_GPT4O_MINI
            else:
                logger.error("❌ No AI Provider API keys found (Groq or OpenAI).")
                # Return demo/mock mode or raise error
                # For now, let's return Groq and let it fail gracefully in orchestrator
        
        logger.info(f"🤖 Initializing AI Provider: {primary_model} (Temp: {temperature})")
        
        try:
            return LLM(
                model=primary_model,
                temperature=temperature,
                timeout=120, # Enterprise timeout
                max_tokens=4096,
                api_key=settings.GROQ_API_KEY if "groq" in primary_model else settings.OPENAI_API_KEY
            )
        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM {primary_model}: {e}")
            raise

    @staticmethod
    def get_fallback_chain() -> List[str]:
        """
        Returns the ordered list of models for failover.
        """
        chain = []
        if settings.GROQ_API_KEY:
            chain.append(AIModel.GROQ_LLAMA_70B)
        if settings.OPENAI_API_KEY:
            chain.append(AIModel.OPENAI_GPT4O)
            chain.append(AIModel.OPENAI_GPT4O_MINI)
        return chain

class ReliableLLM:
    """
    Wrapper for handling retries and provider failover at the operation level.
    Used by the StrategyOrchestrator to ensure high availability.
    """
    def __init__(self):
        self.factory = AIProviderFactory()

    async def execute_with_failover(self, operation_name: str, func, *args, **kwargs):
        """
        Executes a function (usually an agent task) with provider failover.
        """
        models = self.factory.get_fallback_chain()
        last_error = None

        for model in models:
            try:
                logger.info(f"🔄 Attempting {operation_name} using {model}...")
                # Update LLM in kwargs if needed or recreate LLM instance
                # For CrewAI, we usually pass the LLM to the Agent
                return await func(*args, **kwargs, llm_model=model)
            except Exception as e:
                logger.warning(f"⚠️ {operation_name} failed with {model}: {e}")
                last_error = e
                # Wait briefly before failover
                time.sleep(1) 
        
        logger.error(f"🚨 All AI providers failed for {operation_name}. Last error: {last_error}")
        raise last_error
