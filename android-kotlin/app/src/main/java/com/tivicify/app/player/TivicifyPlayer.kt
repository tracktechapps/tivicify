package com.tivicify.app.player

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.TrackSelectionParameters
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.datasource.DefaultHttpDataSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

@OptIn(UnstableApi::class)
class TivicifyPlayer(private val context: Context) {

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    var exoPlayer: ExoPlayer? = null
        private set

    fun initialize(isDataSaver: Boolean = false) {
        if (exoPlayer != null) return

        // Buffer tuned for mobile resilience and weak Wi-Fi
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                if (isDataSaver) 15_000 else 25_000,
                if (isDataSaver) 45_000 else 90_000,
                1_500,
                3_000
            )
            .build()

        val player = ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build()

        // If low bandwidth mode is on, cap video tracks to max 480p
        if (isDataSaver) {
            player.trackSelectionParameters = player.trackSelectionParameters
                .buildUpon()
                .setMaxVideoSize(854, 480)
                .build()
        }

        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(playing: Boolean) {
                _isPlaying.value = playing
            }

            override fun onPlaybackStateChanged(state: Int) {
                when (state) {
                    Player.STATE_BUFFERING -> _isLoading.value = true
                    Player.STATE_READY -> _isLoading.value = false
                    Player.STATE_ENDED -> _isPlaying.value = false
                    Player.STATE_IDLE -> Unit
                }
            }

            override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                _isLoading.value = false
                _errorMessage.value = error.message ?: "Failed to play stream"
            }
        })

        exoPlayer = player
    }

    fun playStream(url: String) {
        val player = exoPlayer ?: return
        _errorMessage.value = null
        _isLoading.value = true

        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Linux; Android; Tivicify)")
            .setConnectTimeoutMs(8000)
            .setReadTimeoutMs(8000)
            .setAllowCrossProtocolRedirects(true)

        if (url.contains(".m3u8", ignoreCase = true)) {
            val mediaSource = HlsMediaSource.Factory(dataSourceFactory)
                .createMediaSource(MediaItem.fromUri(url))
            player.setMediaSource(mediaSource)
        } else {
            player.setMediaItem(MediaItem.fromUri(url))
        }

        player.prepare()
        player.playWhenReady = true
    }

    fun togglePlay() {
        exoPlayer?.let {
            if (it.isPlaying) it.pause() else it.play()
        }
    }

    fun seekRelative(seconds: Int) {
        exoPlayer?.let {
            val target = (it.currentPosition + seconds * 1000).coerceAtLeast(0)
            it.seekTo(target)
        }
    }

    fun setMuted(muted: Boolean) {
        exoPlayer?.volume = if (muted) 0f else 1f
    }

    fun release() {
        exoPlayer?.release()
        exoPlayer = null
    }
}
