package com.tivicify.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ChannelItem(
    val id: String,
    val name: String,
    val logoUrl: String? = null,
    val streamUrl: String,
    val category: String = "General",
    val country: String? = null,
    val currentProgram: String? = null,
    val epgDescription: String? = null,
    val channelNumber: Int = 101
)
