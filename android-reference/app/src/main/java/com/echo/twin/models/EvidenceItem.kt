package com.echo.twin.models

import kotlinx.serialization.Serializable

/**
 * Mirrors `EvidenceItem` in src/lib/types.ts exactly. Keeping this a 1:1 mirror
 * (field names included) means the JSON contract sent to the on-device model is
 * identical to what the web prototype already sends Gemini today — the Synthesis
 * Agent's prompt doesn't need to change shape when the backend changes.
 */
@Serializable
data class EvidenceItem(
    val id: String,
    val source: String, // "cognitive_assessment" | "speech_analysis" | "caregiver_observation" |
                         // "routine_system" | "mri" | "historical_comparison"
    val date: String, // ISO date, e.g. "2026-03-15"
    val summary: String,
    val value: Double? = null,
    val confidence: Double,
)
