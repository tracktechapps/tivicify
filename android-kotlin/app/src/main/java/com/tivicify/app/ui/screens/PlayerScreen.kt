package com.tivicify.app.ui.screens

import android.app.Activity
import android.app.PictureInPictureParams
import android.os.Build
import android.util.Rational
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.tivicify.app.data.model.ChannelItem
import com.tivicify.app.data.model.MediaItem
import com.tivicify.app.data.repository.MediaRepository
import com.tivicify.app.data.repository.RecordingsRepository
import com.tivicify.app.data.repository.TvRepository
import com.tivicify.app.player.TivicifyPlayer
import com.tivicify.app.ui.theme.*
import kotlinx.coroutines.delay

@OptIn(UnstableApi::class)
@Composable
fun PlayerScreen(
    itemId: String,
    itemType: String,
    tvRepository: TvRepository,
    mediaRepository: MediaRepository,
    recordingsRepository: RecordingsRepository,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val tivicifyPlayer = remember { TivicifyPlayer(context) }

    var channel by remember { mutableStateOf<ChannelItem?>(null) }
    var mediaItem by remember { mutableStateOf<MediaItem?>(null) }

    var controlsVisible by remember { mutableStateOf(true) }
    var isDataSaver by remember { mutableStateOf(false) }
    var resizeMode by remember { mutableStateOf(AspectRatioFrameLayout.RESIZE_MODE_FIT) }
    var recordedAlert by remember { mutableStateOf(false) }

    val isPlaying by tivicifyPlayer.isPlaying.collectAsState()
    val isLoading by tivicifyPlayer.isLoading.collectAsState()
    val error by tivicifyPlayer.errorMessage.collectAsState()

    // Resolve channel or media item
    LaunchedEffect(itemId, itemType) {
        if (itemType == "channel") {
            val ch = tvRepository.getChannelById(itemId)
            channel = ch
            if (ch != null) {
                tivicifyPlayer.initialize(isDataSaver)
                tivicifyPlayer.playStream(ch.streamUrl)
            }
        } else {
            val media = mediaRepository.getById(itemId)
            mediaItem = media
            if (media != null) {
                tivicifyPlayer.initialize(isDataSaver)
                tivicifyPlayer.playStream(media.streamUrl)
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            tivicifyPlayer.release()
        }
    }

    // Auto-hide controls after 4 seconds of inactivity
    LaunchedEffect(controlsVisible) {
        if (controlsVisible) {
            delay(4000)
            controlsVisible = false
        }
    }

    val streamTitle = channel?.name ?: mediaItem?.title ?: "Live Streaming"
    val streamSubtitle = channel?.currentProgram ?: mediaItem?.description ?: "Tivicify HD"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                controlsVisible = !controlsVisible
            }
    ) {
        // Player Surface
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    useController = false
                    this.resizeMode = resizeMode
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    this.player = tivicifyPlayer.exoPlayer
                }
            },
            update = { pv ->
                pv.resizeMode = resizeMode
                if (pv.player != tivicifyPlayer.exoPlayer) {
                    pv.player = tivicifyPlayer.exoPlayer
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Loading Indicator
        if (isLoading && error == null) {
            CircularProgressIndicator(
                modifier = Modifier
                    .size(54.dp)
                    .align(Alignment.Center),
                color = AccentCyan,
                strokeWidth = 3.dp
            )
        }

        // Error message retry
        if (error != null) {
            Surface(
                modifier = Modifier
                    .align(Alignment.Center)
                    .padding(24.dp),
                shape = RoundedCornerShape(12.dp),
                color = SurfaceDark.copy(alpha = 0.95f),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = LiveRed,
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Live Stream Unavailable", fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text(
                        text = error ?: "Connection lost",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                    )
                    Button(
                        onClick = {
                            val url = channel?.streamUrl ?: mediaItem?.streamUrl
                            if (url != null) tivicifyPlayer.playStream(url)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                    ) {
                        Text("Retry Connection", color = Color.White)
                    }
                }
            }
        }

        // Heads-up display controls overlay
        AnimatedVisibility(
            visible = controlsVisible,
            enter = fadeIn(),
            exit = fadeOut(),
            modifier = Modifier.fillMaxSize()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.8f),
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.85f)
                            )
                        )
                    )
            ) {
                // Top Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .align(Alignment.TopCenter),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onBack) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = streamTitle,
                                    color = Color.White,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontSize = 16.sp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = LiveRed
                                ) {
                                    Text(
                                        text = "LIVE",
                                        color = Color.White,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = streamSubtitle,
                                color = TextSecondary,
                                fontSize = 12.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Data Saver Toggle
                        IconButton(
                            onClick = {
                                isDataSaver = !isDataSaver
                                tivicifyPlayer.release()
                                tivicifyPlayer.initialize(isDataSaver)
                                val url = channel?.streamUrl ?: mediaItem?.streamUrl
                                if (url != null) tivicifyPlayer.playStream(url)
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.SignalCellularAlt,
                                contentDescription = "Data Saver",
                                tint = if (isDataSaver) SuccessEmerald else Color.White
                            )
                        }

                        // Picture in Picture
                        IconButton(
                            onClick = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    val activity = context as? Activity
                                    activity?.enterPictureInPictureMode(
                                        PictureInPictureParams.Builder()
                                            .setAspectRatio(Rational(16, 9))
                                            .build()
                                    )
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.PictureInPictureAlt,
                                contentDescription = "PiP",
                                tint = Color.White
                            )
                        }
                    }
                }

                // Center Play/Pause & Seek
                Row(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalArrangement = Arrangement.spacedBy(28.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { tivicifyPlayer.seekRelative(-10) },
                        modifier = Modifier
                            .size(50.dp)
                            .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Replay10,
                            contentDescription = "Rewind 10s",
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Surface(
                        shape = CircleShape,
                        color = PrimaryBlue,
                        modifier = Modifier
                            .size(68.dp)
                            .clickable { tivicifyPlayer.togglePlay() }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = "Play/Pause",
                                tint = Color.White,
                                modifier = Modifier.size(38.dp)
                            )
                        }
                    }

                    IconButton(
                        onClick = { tivicifyPlayer.seekRelative(10) },
                        modifier = Modifier
                            .size(50.dp)
                            .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Forward10,
                            contentDescription = "Forward 10s",
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                // Bottom Action Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                        .align(Alignment.BottomCenter),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Record / Save Session Button
                    Button(
                        onClick = {
                            val ch = channel
                            if (ch != null) {
                                recordingsRepository.addRecording(
                                    title = ch.currentProgram ?: "${ch.name} Live Stream",
                                    channelName = ch.name,
                                    streamUrl = ch.streamUrl,
                                    durationSeconds = 1200
                                )
                                recordedAlert = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (recordedAlert) SuccessEmerald else LiveRed
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = if (recordedAlert) Icons.Default.Check else Icons.Default.FiberManualRecord,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (recordedAlert) "Saved to DVR" else "Save / Record", fontSize = 12.sp)
                    }

                    // Aspect Ratio Toggle
                    OutlinedButton(
                        onClick = {
                            resizeMode = when (resizeMode) {
                                AspectRatioFrameLayout.RESIZE_MODE_FIT -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                                AspectRatioFrameLayout.RESIZE_MODE_ZOOM -> AspectRatioFrameLayout.RESIZE_MODE_FILL
                                else -> AspectRatioFrameLayout.RESIZE_MODE_FIT
                            }
                        },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.6f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.AspectRatio, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            when (resizeMode) {
                                AspectRatioFrameLayout.RESIZE_MODE_FIT -> "Fit (16:9)"
                                AspectRatioFrameLayout.RESIZE_MODE_ZOOM -> "Zoom (Fill)"
                                else -> "Stretch"
                            },
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}
