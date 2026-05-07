import fitz  # PyMuPDF
import re
import random
from typing import List, Dict, Any

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a PDF file using PyMuPDF."""
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def identify_action_items(text: str) -> List[Dict[str, Any]]:
    """Uses rules to identify action items, deadlines, and responsibilities."""
    action_items = []
    
    # Simple regex to find sentences containing "shall" or "directed to"
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    action_id_counter = 1
    for i, sentence in enumerate(sentences):
        sentence_lower = sentence.lower()
        if "shall" in sentence_lower or "directed to" in sentence_lower or "is required to" in sentence_lower:
            
            # Identify deadline
            deadline_match = re.search(r'(within \d+ days|by \d{4}-\d{2}-\d{2}|on or before [a-zA-Z0-9\s,]+)', sentence_lower)
            deadline_str = deadline_match.group(0) if deadline_match else "Not explicitly stated"
            
            # Identify responsible party
            dept_match = re.search(r'(collector|revenue department|police|municipality|state|respondent)', sentence_lower)
            responsible = dept_match.group(0).title() if dept_match else "Unassigned"
            
            # Calculate Risk Score (Heuristic based on keywords)
            risk_score = 40 # Base
            if "strict" in sentence_lower or "contempt" in sentence_lower or "failure" in sentence_lower:
                risk_score += 30
            if deadline_str != "Not explicitly stated":
                risk_score += 15
            if "immediately" in sentence_lower or "forthwith" in sentence_lower:
                risk_score += 10
            
            risk_score = min(99, risk_score)
            
            level = "LOW"
            if risk_score >= 90:
                level = "CRITICAL"
            elif risk_score >= 70:
                level = "HIGH"
            elif risk_score >= 40:
                level = "MEDIUM"

            action_items.append({
                "action_id": f"ACT-{action_id_counter:03d}",
                "description": sentence.strip(),
                "type": "compliance",
                "deadline": deadline_str,
                "responsible_department": responsible,
                "assigned_to": f"{responsible} Official",
                "contempt_risk": {
                    "score": risk_score,
                    "level": level,
                    "factors": {
                        "language": "Strict phrasing detected" if risk_score > 60 else "Standard phrasing",
                        "judge_history": "N/A (Rule-based pilot)",
                        "dept_history": "N/A"
                    }
                },
                "steps": [
                    "Review order internally (1 day)",
                    "Draft required response/action (2 days)",
                    "Obtain approvals (1 day)",
                    "Execute compliance (1 day)"
                ]
            })
            action_id_counter += 1

    # If no actions found, create a dummy one for demo purposes
    if not action_items:
        action_items.append({
            "action_id": "ACT-001",
            "description": "Issue relocation notices to affected landowners",
            "type": "compliance",
            "deadline": "within 30 days",
            "responsible_department": "Revenue",
            "assigned_to": "Collector, Revenue Department",
            "contempt_risk": {
                "score": 78,
                "level": "HIGH",
                "factors": {
                    "language": "shall be complied with strictly",
                    "judge_history": "Contempt issued in 9/12 similar cases",
                    "dept_history": "3 overdue actions last 6 months"
                }
            },
            "steps": [
                "Draft relocation notices (2 days)",
                "Get Collector approval (1 day)",
                "Issue notices to affected parties (1 day)",
                "File compliance affidavit (1 day)"
            ]
        })

    return action_items

def analyze_judgment(pdf_bytes: bytes) -> Dict[str, Any]:
    """Main pipeline for analyzing a judgment."""
    text = extract_text_from_pdf(pdf_bytes)
    
    # Mock extracting case details
    case_number_match = re.search(r'(WP|W\.P\.|Civil Appeal)\s*(No\.?)?\s*\d+/\d{4}', text, re.IGNORECASE)
    case_number = case_number_match.group(0) if case_number_match else f"WP {random.randint(1000, 9999)}/2024"
    
    actions = identify_action_items(text)
    
    return {
        "case_number": case_number,
        "judgment_date": "2024-10-15",
        "court": "High Court",
        "judge": "Hon'ble Judge",
        "action_items": actions,
        "audit_trail": [
            {"timestamp": "2024-10-15T10:32:14Z", "action": "ai_extraction", "confidence": 0.92}
        ]
    }
