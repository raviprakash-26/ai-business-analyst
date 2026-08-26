from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Conversation:
    conversation_id: str
    messages: list[dict[str, str]] = field(default_factory=list)

    def add(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})

    def recent(self, limit: int = 10) -> list[dict[str, str]]:
        return self.messages[-limit:]


class ConversationStore:
    """Simple in-memory conversation store; replace with Redis/database later."""

    def __init__(self) -> None:
        self._items: dict[str, Conversation] = {}

    def get_or_create(self, conversation_id: str) -> Conversation:
        if conversation_id not in self._items:
            self._items[conversation_id] = Conversation(conversation_id)
        return self._items[conversation_id]

    def snapshot(self, conversation_id: str) -> dict[str, Any]:
        conversation = self.get_or_create(conversation_id)
        return {"conversation_id": conversation_id, "messages": conversation.recent()}


store = ConversationStore()
