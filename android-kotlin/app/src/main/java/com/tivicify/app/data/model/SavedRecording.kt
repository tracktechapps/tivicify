package com.tivicify.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class SavedRecording(
    val id: String,
    val title: String,
    val channelName: String,
    val durationSeconds: Long,
    val recordedAt: String,
    val localFilePath: String? = null,
    val streamUrl: String,
    val category: String = "General"
)
