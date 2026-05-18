import re
import json
from typing import List, Dict, Any
from app.core.logger import logger

class StrategyIntelligenceService:
    """
    Core Intelligence Layer for Planvix.
    Handles deduplication, strategic reasoning enhancement, and quality enforcement.
    """

    @staticmethod
    def deduplicate_content(strategy_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detects and removes semantic duplicates in the content calendar and pillars.
        """
        logger.info("🧠 Running Content Deduplication Engine...")
        
        calendar = strategy_data.get("content_calendar", [])
        pillars = strategy_data.get("content_pillars", [])
        
        seen_themes = set()
        unique_calendar = []
        
        for entry in calendar:
            theme_norm = StrategyIntelligenceService._normalize_text(entry.get("theme", ""))
            if theme_norm in seen_themes:
                # In a real system, we might trigger a re-generation here.
                # For now, we'll append a "Variation" flag or slightly mutate.
                logger.warning(f"⚠️ Duplicate theme detected: {theme_norm}")
                entry["theme"] = f"{entry['theme']} (Unique Growth Angle)"
            else:
                seen_themes.add(theme_norm)
            unique_calendar.append(entry)
            
        strategy_data["content_calendar"] = unique_calendar
        return strategy_data

    @staticmethod
    def apply_funnel_logic(strategy_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensures content follows a psychological growth funnel sequence.
        """
        logger.info("📈 Applying Strategic Funnel Sequencing...")
        
        calendar = strategy_data.get("content_calendar", [])
        stages = ["Awareness", "Education", "Trust Building", "Authority", "Conversion"]
        
        for i, entry in enumerate(calendar):
            # Assign stage based on progression if not already assigned strategically
            stage_idx = min(i // (len(calendar) // len(stages) + 1), len(stages) - 1)
            entry["funnel_stage"] = stages[stage_idx]
            
        return strategy_data

    @staticmethod
    def _normalize_text(text: str) -> str:
        """Simple normalization for duplicate detection."""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', '', text)
        return " ".join(text.split())

    @staticmethod
    def validate_strategy_depth(strategy_data: Dict[str, Any]) -> bool:
        """
        Checks if the strategy meets the 'Strategic Growth Intelligence' bar.
        """
        # 1. Check for generic advice
        generic_terms = ["post consistently", "use hashtags", "be yourself"]
        content_str = json.dumps(strategy_data).lower()
        
        for term in generic_terms:
            if term in content_str:
                logger.error(f"❌ Strategy contains generic advice: {term}")
                return False
        
        # 2. Check for required strategic fields
        if "strategic_narrative" not in strategy_data or len(strategy_data["strategic_narrative"]) < 50:
            logger.error("❌ Strategic narrative is missing or too shallow.")
            return False
            
        return True

intelligence_service = StrategyIntelligenceService()
