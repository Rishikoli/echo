package com.echo.twin.tools

/**
 * Direct port of src/lib/agents/routerAgent.ts. Deliberately unchanged from Round 1
 * to Round 2 — see that file's comment for why intent classification stays
 * deterministic rather than becoming a model call: every additional inference pass
 * on a phone costs real, user-visible seconds, and picking one of five fixed
 * intents doesn't need a language model to do reliably.
 */
enum class Intent {
    FIRST_CHANGE,
    SIMILAR_PERIOD,
    FORENSICS,
    EVIDENCE,
    WHAT_CHANGED,
}

object RouterAgent {
    fun classifyIntent(question: String): Intent {
        val q = question.lowercase()
        return when {
            q.contains("changed first") || q.contains("first change") || q.contains("earliest") -> Intent.FIRST_CHANGE
            q.contains("happened before") || q.contains("similar") || q.contains("before") -> Intent.SIMILAR_PERIOD
            q.contains("why") || q.contains("flagged") || q.contains("forensic") -> Intent.FORENSICS
            q.contains("evidence") -> Intent.EVIDENCE
            else -> Intent.WHAT_CHANGED
        }
    }
}
