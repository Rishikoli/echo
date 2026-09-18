package com.echo.twin.models

import kotlinx.serialization.Serializable

/** Mirrors `ToolTraceStep` in src/lib/types.ts. One entry per agent call made while
 * answering a question — this is what powers the "Tool execution trace" UI, and
 * should be populated by RouterAgent.kt / the tool-agent equivalents the same way
 * gemini.ts's `routeQuestion()` builds it today. */
@Serializable
data class ToolTraceStep(
    val tool: String,
    val summary: String,
)
