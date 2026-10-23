package com.tivicify.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class AppSettings(
    val tvMode: Boolean = false,
    val kidsMode: Boolean = false,
    val lowBandwidthMode: Boolean = false, // Data Saver mode
    val enableParentalPin: Boolean = false,
    val parentalPin: String = "",
    val soundEffects: Boolean = true,
    val themeColor: String = "blue"
)
