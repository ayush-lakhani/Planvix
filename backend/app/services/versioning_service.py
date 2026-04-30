from app.core.mongo import strategies_collection
from app.models.schemas import StrategyInput

class VersioningService:
    def get_next_version(self, user_id: str, strategy_input: StrategyInput) -> int:
        """
        Calculates the next version number for a strategy based on inputs.
        """
        existing_strategy = strategies_collection.find_one({
            "user_id": user_id,
            "goal": strategy_input.goal,
            "audience": strategy_input.audience,
            "platform": strategy_input.platform,
            "is_deleted": {"$ne": True}
        }, sort=[("version", -1)])
        
        if existing_strategy and "version" in existing_strategy:
            return existing_strategy["version"] + 1
        elif existing_strategy:
            return 2
        return 1

versioning_service = VersioningService()
