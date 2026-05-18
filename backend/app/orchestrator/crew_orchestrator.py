from crewai import Task, Crew, Process, LLM
from app.models.schemas import StrategyInput
from app.core.config import settings
from app.core.security import PromptSanitizer
from app.core.ai import AIProviderFactory, AIModel
from app.core.logger import logger, log_event

from datetime import datetime, timezone
import json
import os
import asyncio
import anyio
from typing import Optional, Callable, Dict, Any

# Disable LiteLLM proxy mode
os.environ["LITELLM_PROXY_MODE"] = "false"

class StrategyOrchestrator:
    """
    Enterprise-grade Strategy Orchestrator.
    Handles parallel agent execution, provider failover, and progress streaming.
    """
    def __init__(self):
        self.primary_llm = None
        self.fallback_llm = None

    async def generate_strategy(
        self, 
        strategy_input: StrategyInput, 
        progress_callback: Optional[Callable[[str, int], Any]] = None
    ) -> Dict[str, Any]:
        """
        Main orchestration pipeline.
        
        Args:
            strategy_input: Validated user requirements.
            progress_callback: Async function to stream progress (status_text, percentage).
        """
        
        # 1. Initialize AI Models
        if not self.primary_llm:
            self.primary_llm = AIProviderFactory.get_llm()
        
        # 2. Sanitize Inputs
        inputs = self._prepare_inputs(strategy_input)
        
        # 3. Create Agents (Lazy Loaded)
        from app.services.agents.persona_agent import create_persona_agent
        from app.services.agents.trend_agent import create_trend_agent
        from app.services.agents.traffic_agent import create_traffic_agent
        from app.services.agents.synthesis_agent import create_synthesis_agent
        from app.services.agents.roi_agent import create_roi_agent

        persona_agent = create_persona_agent(self.primary_llm)
        trend_agent = create_trend_agent(self.primary_llm)
        traffic_agent = create_traffic_agent(self.primary_llm)
        synthesis_agent = create_synthesis_agent(self.primary_llm)
        roi_agent = create_roi_agent(self.primary_llm)

        # Context block
        STRATEGY_CONTEXT = self._build_context(inputs, strategy_input.strategy_mode)

        # === STAGE 1: Parallel Discovery ===
        if progress_callback: await progress_callback("Extracting Niche Intelligence...", 20)
        
        task_persona = Task(
            description=f"""{STRATEGY_CONTEXT}
            DECONSTRUCT the audience psychographics. 
            Identify 'Hidden Objections' and 'Dopamine Triggers'.
            Return JSON matching 'StrategicOverview' requirements.""",
            expected_output="Deep psychological persona profile in JSON.",
            agent=persona_agent
        )
        task_trends = Task(
            description=f"""{STRATEGY_CONTEXT}
            PERFORM competitive gap analysis. 
            Detect underserved content patterns and 'Structural Hooks'.
            Return JSON for 'growth_intelligence' field.""",
            expected_output="Competitive intelligence & trend analysis in JSON.",
            agent=trend_agent
        )

        log_event("stage_start", {"stage": "niche_intelligence", "agents": ["persona", "trend"]})
        
        crew_p = Crew(agents=[persona_agent], tasks=[task_persona], verbose=False)
        crew_t = Crew(agents=[trend_agent], tasks=[task_trends], verbose=False)

        try:
            results = await asyncio.gather(
                anyio.to_thread.run_sync(crew_p.kickoff),
                anyio.to_thread.run_sync(crew_t.kickoff)
            )
        except Exception as e:
            logger.error(f"❌ Stage 1 Intelligence Failed: {e}")
            return await self._handle_failover(strategy_input, progress_callback)

        persona_data = str(results[0])
        trend_data = str(results[1])

        # === STAGE 2: Synthesis & Growth Architecture ===
        if progress_callback: await progress_callback("Designing Strategic Funnel...", 60)
        
        DISCOVERY_CONTEXT = f"PERSONA_INTELLIGENCE: {persona_data}\nNICHE_GAPS: {trend_data}"
        
        task_traffic = Task(
            description=f"""{STRATEGY_CONTEXT}\n{DISCOVERY_CONTEXT}
            MAP search intent clusters. For each keyword, provide intent, competition, 
            and discovery hypothesis. Return JSON matching 'KeywordStats' schema.""",
            expected_output="Search intent discovery pack in JSON.",
            agent=traffic_agent
        )
        task_strategy = Task(
            description=f"""{STRATEGY_CONTEXT}\n{DISCOVERY_CONTEXT}
            ARCHITECT a 30-day psychological funnel. 
            For every post, provide: Hook Psychology, Visual Storytelling, Pacing, and Funnel Stage.
            Ensure 'Strategic Narrative' flows logically. No generic advice.
            Return JSON matching 'ContentPillar' and 'CalendarEntry' schemas.""",
            expected_output="Growth narrative and content calendar in JSON.",
            agent=synthesis_agent,
            context=[task_traffic]
        )
        task_roi = Task(
            description=f"""{STRATEGY_CONTEXT}\n{DISCOVERY_CONTEXT}
            PERFORM final quality validation. 
            Calculate 'Confidence Score' based on logic strength. 
            Identify the 'Growth Hypothesis' for the entire strategy.
            Return COMPLETE MERGED JSON matching 'ContentStrategy' schema.""",
            expected_output="Final validated Strategic Growth Intelligence asset in JSON.",
            agent=roi_agent,
            context=[task_traffic, task_strategy]
        )

        final_crew = Crew(
            agents=[traffic_agent, synthesis_agent, roi_agent],
            tasks=[task_traffic, task_strategy, task_roi],
            process=Process.sequential,
            verbose=False
        )

        if progress_callback: await progress_callback("Validating Strategic Depth...", 85)
        
        try:
            final_result = await anyio.to_thread.run_sync(final_crew.kickoff)
            
            # Post-Processing Intelligence Layer
            from app.services.intelligence import intelligence_service
            data = self._extract_json(str(final_result))
            
            # 1. Deduplication
            data = intelligence_service.deduplicate_content(data)
            
            # 2. Funnel Sequencing Verification
            data = intelligence_service.apply_funnel_logic(data)
            
            if progress_callback: await progress_callback("Evolution Complete!", 100)
            return self._parse_final_output(data, AIModel.GROQ_LLAMA_70B)
        except Exception as e:
            logger.error(f"❌ Stage 2 Synthesis Failed: {e}")
            return await self._handle_failover(strategy_input, progress_callback)

    async def _handle_failover(
        self, 
        strategy_input: StrategyInput, 
        progress_callback: Optional[Callable]
    ) -> Dict[str, Any]:
        """
        Handles failover to secondary AI provider (OpenAI).
        """
        if not settings.OPENAI_API_KEY:
            logger.error("❌ Failover triggered but OPENAI_API_KEY is missing.")
            raise RuntimeError("Primary AI failed and no fallback configured.")

        logger.warning("🔄 Triggering Enterprise Failover to OpenAI...")
        if progress_callback: await progress_callback("Provider failover active. Retrying...", 50)
        
        # Re-run with OpenAI
        self.fallback_llm = AIProviderFactory.get_llm(model_name=AIModel.OPENAI_GPT4O)
        # Note: In a real failover, we might want to use a simplified one-shot prompt 
        # or a smaller crew to ensure completion if complexity was the cause.
        # For now, we reuse the same logic but with OpenAI LLM.
        
        # Reset and retry (Simplified for this pass)
        # In a real system, we'd refactor the main loop to be recursive or iterative.
        # This is a placeholder for the logic.
        return {"error": "Failover implementation in progress", "retry_recommended": True}

    def _prepare_inputs(self, si: StrategyInput) -> Dict[str, str]:
        return {
            "goal": PromptSanitizer.sanitize(si.goal),
            "audience": PromptSanitizer.sanitize(si.audience),
            "industry": PromptSanitizer.sanitize(si.industry),
            "platform": PromptSanitizer.sanitize(si.platform),
            "content_type": PromptSanitizer.sanitize(si.contentType),
            "experience": PromptSanitizer.sanitize(si.experience)
        }

    def _build_context(self, inputs: Dict[str, str], mode: str) -> str:
        return f"""
        CLIENT CONTEXT:
        - Goal: {inputs['goal']}
        - Audience: {inputs['audience']}
        - Industry: {inputs['industry']}
        - Platform: {inputs['platform']}
        - Type: {inputs['content_type']}
        - Exp: {inputs['experience']}
        - Mode: {mode.upper()}
        """

    def _parse_final_output(self, result, model_used: str) -> Dict[str, Any]:
        try:
            data = self._extract_json(str(result))
            data["metadata"] = {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "provider": model_used,
                "status": "success",
                "version": settings.VERSION
            }
            return data
        except Exception as e:
            logger.error(f"❌ JSON Extraction Failed: {e}")
            raise ValueError("Failed to parse agent output into structured JSON.")

    def _extract_json(self, text: str) -> Dict[str, Any]:
        text = str(text).strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start:end+1]
        return json.loads(text)

orchestrator = StrategyOrchestrator()
