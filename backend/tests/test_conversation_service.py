from app.services.conversation_service import ConversationStore


def test_conversation_keeps_recent_messages() -> None:
    store = ConversationStore()
    conversation = store.get_or_create("demo")
    conversation.add("user", "Which region is best?")
    conversation.add("assistant", "North has the highest profit.")

    snapshot = store.snapshot("demo")

    assert snapshot["conversation_id"] == "demo"
    assert len(snapshot["messages"]) == 2
    assert snapshot["messages"][0]["role"] == "user"
