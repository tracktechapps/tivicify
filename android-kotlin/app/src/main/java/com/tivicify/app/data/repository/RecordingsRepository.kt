package com.tivicify.app.data.repository

import com.tivicify.app.data.model.SavedRecording
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RecordingsRepository {
    private val _recordings = MutableStateFlow<List<SavedRecording>>(
        listOf(
            SavedRecording(
                id = "rec-arise-1",
                title = "The Morning Show - Special Panel",
                channelName = "Arise News HD",
                durationSeconds = 1840,
                recordedAt = "Today, 08:30 AM",
                streamUrl = "https://origin.arisetv.broadcasthost.net/arise/ng/live/playlist.m3u8",
                category = "News"
            ),
            SavedRecording(
                id = "rec-tvc-1",
                title = "Journalists' Hangout Live Analysis",
                channelName = "TVC News Nigeria",
                durationSeconds = 2400,
                recordedAt = "Yesterday, 05:00 PM",
                streamUrl = "https://d10r176cvsfd27.cloudfront.net/out/v1/d6fa8dfef68146aa868f0ef18dcf9222/index.m3u8",
                category = "Current Affairs"
            ),
            SavedRecording(
                id = "rec-supersport-1",
                title = "UEFA Champions League Highlights",
                channelName = "SuperSport Sports Zone",
                durationSeconds = 3120,
                recordedAt = "2 days ago",
                streamUrl = "https://stream.redbull.tv/tv/linear/index.m3u8",
                category = "Sports"
            )
        )
    )
    val recordings: StateFlow<List<SavedRecording>> = _recordings.asStateFlow()

    fun addRecording(title: String, channelName: String, streamUrl: String, durationSeconds: Long = 0) {
        val dateFormat = SimpleDateFormat("MMM dd, hh:mm a", Locale.getDefault())
        val newRec = SavedRecording(
            id = "rec-${System.currentTimeMillis()}",
            title = title,
            channelName = channelName,
            durationSeconds = durationSeconds,
            recordedAt = dateFormat.format(Date()),
            streamUrl = streamUrl
        )
        _recordings.value = listOf(newRec) + _recordings.value
    }

    fun deleteRecording(id: String) {
        _recordings.value = _recordings.value.filter { it.id != id }
    }
}
