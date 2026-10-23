package com.tivicify.app.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class MediaType {
    MOVIE, TV, LIVE, ANIMATION, DOCUMENTARY
}

@Serializable
enum class StreamType {
    HLS, MP4, EMBED
}

@Serializable
data class MediaItem(
    val id: String,
    val title: String,
    val originalTitle: String? = null,
    val description: String,
    val type: MediaType = MediaType.MOVIE,
    val genres: List<String> = emptyList(),
    val posterUrl: String,
    val backdropUrl: String? = null,
    val streamUrl: String,
    val streamType: StreamType = StreamType.HLS,
    val year: Int = 2024,
    val duration: String? = null,
    val rating: String? = null,
    val isPublicDomain: Boolean = false,
    val director: String? = null,
    val cast: List<String> = emptyList(),
    val featured: Boolean = false
)
