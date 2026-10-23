package com.tivicify.app.data.repository

import com.tivicify.app.data.datasource.CuratedMedia
import com.tivicify.app.data.model.MediaItem
import com.tivicify.app.data.model.MediaType
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class MediaRepository {
    private val _items = MutableStateFlow<List<MediaItem>>(CuratedMedia.items)
    val items: StateFlow<List<MediaItem>> = _items.asStateFlow()

    fun getFeatured(): List<MediaItem> = _items.value.filter { it.featured }

    fun getMovies(): List<MediaItem> = _items.value.filter { it.type == MediaType.MOVIE }

    fun getShows(): List<MediaItem> = _items.value.filter { it.type == MediaType.TV }

    fun getDocumentaries(): List<MediaItem> = _items.value.filter { it.type == MediaType.DOCUMENTARY }

    fun getById(id: String): MediaItem? = _items.value.find { it.id == id }

    fun search(query: String): List<MediaItem> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return _items.value
        return _items.value.filter {
            it.title.lowercase().contains(q) ||
            it.genres.any { g -> g.lowercase().contains(q) } ||
            it.cast.any { c -> c.lowercase().contains(q) } ||
            (it.director?.lowercase()?.contains(q) == true)
        }
    }
}
