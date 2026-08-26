from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.ai_response_service import generate_response
from app.services.conversation_service import store
from app.services.dataset_service import load_dataframe
from app.services.explanation_service import build_explanation
from app.services.query_engine import analyze_question

router = APIRouter(prefix="/conversation", tags=["conversation"])


@router.post("/ask")
async def ask_in_conversation(
    conversation_id: str = Form(...),
    question: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    if not conversation_id.strip() or not question.strip():
        raise HTTPException(status_code=400, detail="conversation_id and question are required")

    try:
        dataframe = load_dataframe(file.filename or "", await file.read())
        conversation = store.get_or_create(conversation_id.strip())
        analysis = analyze_question(dataframe, question)
        context = build_explanation(question, analysis)["llm_context"]
        context["conversation_history"] = conversation.recent()
        response = generate_response(context)
        conversation.add("user", question.strip())
        conversation.add("assistant", response["answer"])
        response["conversation_id"] = conversation.conversation_id
        response["history"] = conversation.recent()
        return response
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{conversation_id}")
def get_conversation(conversation_id: str) -> dict:
    return store.snapshot(conversation_id)
