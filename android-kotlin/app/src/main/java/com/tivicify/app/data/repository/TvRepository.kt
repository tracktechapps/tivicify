package com.tivicify.app.data.repository

import com.tivicify.app.data.datasource.CuratedChannels
import com.tivicify.app.data.model.ChannelItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class TvRepository {

    private val _channels = MutableStateFlow<List<ChannelItem>>(CuratedChannels.channels)
    val channels: StateFlow<List<ChannelItem>> = _channels.asStateFlow()

    fun getChannelById(id: String): ChannelItem? {
        return _channels.value.find { it.id == id }
    }

    fun getChannelsByCategory(category: String): List<ChannelItem> {
        if (category == "All") return _channels.value
        return _channels.value.filter {
            it.category.contains(category, ignoreCase = true) ||
            (category.contains("Nigeria", ignoreCase = true) && (it.country?.contains("Nigeria", ignoreCase = true) == true))
        }
    }

    fun searchChannels(query: String): List<ChannelItem> {
        val trimmed = query.trim().lowercase()
        if (trimmed.isEmpty()) return _channels.value
        return _channels.value.filter {
            it.name.lowercase().contains(trimmed) ||
            it.category.lowercase().contains(trimmed) ||
            (it.country?.lowercase()?.contains(trimmed) == true) ||
            (it.currentProgram?.lowercase()?.contains(trimmed) == true)
        }
    }

    suspend fun importM3uPlaylist(urlStr: String): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val url = URL(urlStr)
            val connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Android; Tivicify)")

            val reader = BufferedReader(InputStreamReader(connection.inputStream))
            val imported = mutableListOf<ChannelItem>()
            var line: String?
            var currentName = "Live Channel"
            var currentLogo: String? = null
            var currentCategory = "General"
            var currentCountry: String? = null
            var count = 0

            while (reader.readLine().also { line = it } != null) {
                val l = line?.trim() ?: continue
                if (l.startsWith("#EXTINF:")) {
                    // Extract name after last comma
                    val commaIndex = l.lastIndexOf(',')
                    if (commaIndex != -1 && commaIndex < l.length - 1) {
                        currentName = l.substring(commaIndex + 1).trim()
                    }
                    // Extract tvg-logo
                    val logoMatch = Regex("""tvg-logo="([^"]+)"""").find(l)
                    currentLogo = logoMatch?.groupValues?.get(1)
                    // Extract group-title
                    val groupMatch = Regex("""group-title="([^"]+)"""").find(l)
                    currentCategory = groupMatch?.groupValues?.get(1)?.split(";")?.firstOrNull() ?: "General"
                } else if (l.startsWith("http://") || l.startsWith("https://")) {
                    count++
                    imported.add(
                        ChannelItem(
                            id = "imported-${imported.size}-${System.currentTimeMillis()}",
                            name = currentName,
                            logoUrl = currentLogo,
                            streamUrl = l,
                            category = currentCategory,
                            country = currentCountry,
                            currentProgram = "Live Broadcasting",
                            channelNumber = 500 + count
                        )
                    )
                    currentName = "Live Channel"
                    currentLogo = null
                }
            }
            reader.close()

            if (imported.isNotEmpty()) {
                val existing = _channels.value.toMutableList()
                existing.addAll(imported)
                _channels.value = existing
                Result.success(imported.size)
            } else {
                Result.failure(Exception("No streams found in playlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
