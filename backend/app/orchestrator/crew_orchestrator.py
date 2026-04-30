from crewai import Task, Crew, Process, LLM
from app.models.schemas import StrategyInput
from app.core.config import settings

from datetime import datetime
import json
import os

# Disable LiteLLM proxy mode to prevent proxy-related errors
os.environ["LITELLM_PROXY_MODE"] = "false"


class StrategyOrchestrator:
    def __init__(self):
        self.llm = None

    def generate_strategy(self, strategy_input: StrategyInput) -> dict:
        """
        Main orchestration pipeline for multi-agent strategy generation.
        """

        # Initialize LLM once
        if self.llm is None:
            self.llm = LLM(
                model="groq/llama-3.3-70b-versatile",
                temperature=0.5,
                api_key=settings.GROQ_API_KEY
            )

        # Lazy import agents (avoids circular import issues)
        from app.services.agents.persona_agent import create_persona_agent
        from app.services.agents.trend_agent import create_trend_agent
        from app.services.agents.traffic_agent import create_traffic_agent
        from app.services.agents.synthesis_agent import create_synthesis_agent
        from app.services.agents.roi_agent import create_roi_agent

        persona_agent = create_persona_agent(self.llm)
        trend_agent = create_trend_agent(self.llm)
        traffic_agent = create_traffic_agent(self.llm)
        synthesis_agent = create_synthesis_agent(self.llm)
        roi_agent = create_roi_agent(self.llm)

        # Context block
        STRATEGY_CONTEXT = f"""
        CLIENT CONTEXT:
        - Business Goal: {strategy_input.goal}
        - Target Audience: {strategy_input.audience}
        - Industry: {strategy_input.industry}
        - Platform: {strategy_input.platform}
        - Content Type: {strategy_input.contentType}
        - Experience Level: {strategy_input.experience}
        - Strategy Mode: {strategy_input.strategy_mode.upper()}
        """

        # === TASKS ===

        task_persona = Task(
            description=f"""
            {STRATEGY_CONTEXT}
            Analyze the audience deeply.

            Return JSON:
            {{
                "summary": "2 sentence persona summary",
                "pain_points": ["point1", "point2", "point3", "point4", "point5"],
                "triggers": ["trigger1", "trigger2", "trigger3", "trigger4", "trigger5"]
            }}
            """,
            expected_output="JSON persona object.",
            agent=persona_agent
        )

        task_trends = Task(
            description=f"""
            {STRATEGY_CONTEXT}
            Identify industry gaps and trends.

            Return JSON:
            {{
                "gaps": ["gap1", "gap2", "gap3"],
                "trends": ["trend1", "trend2", "trend3"],
                "hook_angles": ["hook1", "hook2", "hook3"]
            }}
            """,
            expected_output="JSON trend object.",
            agent=trend_agent,
            context=[task_persona]
        )

        task_traffic = Task(
            description=f"""
            {STRATEGY_CONTEXT}
            Generate SEO and discovery pack.

            Return JSON:
            {{
                "primary": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
                "long_tail": ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5"],
                "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"]
            }}
            """,
            expected_output="JSON keyword object.",
            agent=traffic_agent,
            context=[task_persona, task_trends]
        )

        task_strategy = Task(
            description=f"""
            {STRATEGY_CONTEXT}
            Create full execution plan.

            Return JSON:
            {{
                "strategic_overview": {{
                    "growth_objective": "clear goal",
                    "target_persona_snapshot": "persona summary",
                    "positioning_angle": "unique angle",
                    "competitive_edge": "why we win"
                }},
                "content_pillars": [
                    {{
                        "pillar_name": "Pillar 1",
                        "why_it_works": "reason",
                        "sample_posts": [
                            {{
                                "format": "{strategy_input.contentType}",
                                "hook": "hook",
                                "script_or_structure": "structure",
                                "caption": "caption",
                                "cta": "cta",
                                "image_prompt": "visual prompt"
                            }}
                        ]
                    }}
                ],
                "content_calendar": [
                    {{
                        "day": 1,
                        "format": "{strategy_input.contentType}",
                        "theme": "Theme name"
                    }}
                ]
            }}
            """,
            expected_output="JSON strategy object.",
            agent=synthesis_agent,
            context=[task_persona, task_trends, task_traffic]
        )

        task_roi = Task(
            description=f"""
            {STRATEGY_CONTEXT}
            
            You have access to outputs from previous agents:
            - Persona insights (task_persona)
            - Trend analysis (task_trends)
            - SEO keywords (task_traffic)
            - Full strategy (task_strategy)
            
            Your job: Merge EVERYTHING into one final JSON structure.
            
            Return EXACTLY this complete JSON (fill in all sections):
            {{
                "strategic_overview": {{
                    "growth_objective": "from task_strategy",
                    "target_persona_snapshot": "from task_strategy",
                    "positioning_angle": "from task_strategy",
                    "competitive_edge": "from task_strategy"
                }},
                "content_pillars": [
                    {{
                        "pillar_name": "from task_strategy",
                        "why_it_works": "from task_strategy",
                        "sample_posts": [
                            {{
                                "format": "{strategy_input.contentType}",
                                "hook": "from task_strategy",
                                "script_or_structure": "from task_strategy",
                                "caption": "from task_strategy",
                                "cta": "from task_strategy",
                                "image_prompt": "from task_strategy"
                            }}
                        ]
                    }}
                ],
                "content_calendar": [
                    {{
                        "day": 1,
                        "format": "{strategy_input.contentType}",
                        "theme": "from task_strategy"
                    }}
                ],
                "keywords": {{
                    "primary": ["from task_traffic"],
                    "long_tail": ["from task_traffic"],
                    "hashtags": ["from task_traffic"]
                }},
                "roi_prediction": {{
                    "traffic_lift_percentage": "XX%",
                    "engagement_boost_percentage": "XX%",
                    "estimated_monthly_reach": "XK-XK",
                    "conversion_rate_estimate": "X.X%",
                    "risk_level": "Low/Medium/High"
                }}
            }}
            """,
            expected_output="Complete merged JSON with all strategy components.",
            agent=roi_agent,
            context=[task_persona, task_trends, task_traffic, task_strategy]
        )

        crew = Crew(
            agents=[persona_agent, trend_agent, traffic_agent, synthesis_agent, roi_agent],
            tasks=[task_persona, task_trends, task_traffic, task_strategy, task_roi],
            process=Process.sequential,
            verbose=True
        )

        result = crew.kickoff()
        
        print("\n" + "="*80)
        print("🔍 CREW RAW RESULT:")
        print(result)
        print("="*80 + "\n")

        return self._parse_final_output(result)

    # === OUTPUT PARSER ===

    def _parse_final_output(self, crew_result):
        """
        Parse the final crew result (which contains the merged output from the ROI task).
        CrewAI v0.28+ returns only the final task output, not individual task outputs.
        """
        try:
            # Extract JSON from crew result
            final_data = self._extract_json(str(crew_result))
            
            # Add metadata
            final_data["metadata"] = {
                "generated_at": datetime.now().isoformat(),
                "model": "groq/llama-3.3-70b-versatile"
            }
            
            # Validate required fields
            required_fields = ["strategic_overview", "content_pillars", "content_calendar", "keywords", "roi_prediction"]
            missing = [f for f in required_fields if f not in final_data]
            
            if missing:
                raise ValueError(f"Missing required fields in agent output: {missing}")
            
            return final_data

        except Exception as e:
            print(f"❌ Error parsing crew output: {e}")
            raise ValueError(f"Agent generation failed: {str(e)}")

    def _extract_json(self, text: str):
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
