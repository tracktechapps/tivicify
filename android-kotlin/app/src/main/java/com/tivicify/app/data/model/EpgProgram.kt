package com.tivicify.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class EpgProgram(
    val title: String,
    val start: String,
    val end: String,
    val description: String? = null,
    val progressPercent: Int = 50,
    val remainingMinutes: Int = 30
)
