package com.tivicify.app.ui.screens

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import com.tivicify.app.data.repository.TvRepository
import com.tivicify.app.player.MultiViewLayout
import com.tivicify.app.player.MultiViewManager
import com.tivicify.app.ui.components.ChannelPickerModal
import com.tivicify.app.ui.theme.*

@OptIn(UnstableApi::class)
@Composable
fun MultiViewScreen(
    tvRepository: TvRepository,
    onNavigateFullscreen: (ChannelItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val allChannels by tvRepository.channels.collectAsState()

    val multiViewManager = remember {
        MultiViewManager(context)
    }

    LaunchedEffect(Unit) {
        if (allChannels.isNotEmpty()) {
            multiViewManager.initialize(allChannels)
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            multiViewManager.release()
        }
    }

    val currentLayout by multiViewManager.layout.collectAsState()
    val audioFocusIndex by multiViewManager.audioFocusIndex.collectAsState()
    val spotlightIndex by multiViewManager.spotlightIndex.collectAsState()
    val activeSlots by multiViewManager.slots.collectAsState()

    var pickerSlotIndex by remember { mutableStateOf<Int?>(null) }

    if (pickerSlotIndex != null) {
        ChannelPickerModal(
            slotIndex = pickerSlotIndex!!,
            channels = allChannels,
            onChannelSelected = { selected ->
                multiViewManager.setChannelForSlot(pickerSlotIndex!!, selected)
                pickerSlotIndex = null
            },
            onDismiss = { pickerSlotIndex = null }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        // Multi-View Control Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = SurfaceDark,
            border = BorderStroke(1.dp, BorderDark)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = CircleShape,
                            color = LiveRed,
                            modifier = Modifier.size(8.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Multi-View Engine",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary
                        )
                    }
                    Text(
                        text = "Audio: Screen ${audioFocusIndex + 1} (${activeSlots.getOrNull(audioFocusIndex)?.name ?: "Live"})",
                        color = AccentCyan,
                        fontSize = 11.sp
                    )
                }

                // Layout Selector Buttons
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FilterChip(
                        selected = currentLayout == MultiViewLayout.QUAD,
                        onClick = { multiViewManager.setLayout(MultiViewLayout.QUAD) },
                        label = { Text("Quad (4)", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBlue,
                            selectedLabelColor = Color.White,
                            containerColor = SurfaceCard,
                            labelColor = TextSecondary
                        )
                    )

                    FilterChip(
                        selected = currentLayout == MultiViewLayout.DUAL,
                        onClick = { multiViewManager.setLayout(MultiViewLayout.DUAL) },
                        label = { Text("Dual (2)", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBlue,
                            selectedLabelColor = Color.White,
                            containerColor = SurfaceCard,
                            labelColor = TextSecondary
                        )
                    )

                    FilterChip(
                        selected = currentLayout == MultiViewLayout.SPOTLIGHT,
                        onClick = { multiViewManager.setLayout(MultiViewLayout.SPOTLIGHT) },
                        label = { Text("Spotlight", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBlue,
                            selectedLabelColor = Color.White,
                            containerColor = SurfaceCard,
                            labelColor = TextSecondary
                        )
                    )
                }
            }
        }

        // Screens Grid / Container
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(6.dp)
        ) {
            when (currentLayout) {
                MultiViewLayout.QUAD -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        Row(modifier = Modifier.weight(1f).fillMaxWidth()) {
                            MultiViewSlot(
                                index = 0,
                                channel = activeSlots.getOrNull(0),
                                multiViewManager = multiViewManager,
                                isAudioActive = audioFocusIndex == 0,
                                onChangeChannel = { pickerSlotIndex = 0 },
                                onFullscreen = { activeSlots.getOrNull(0)?.let(onNavigateFullscreen) },
                                modifier = Modifier.weight(1f).fillMaxHeight().padding(3.dp)
                            )
                            MultiViewSlot(
                                index = 1,
                                channel = activeSlots.getOrNull(1),
                                multiViewManager = multiViewManager,
                                isAudioActive = audioFocusIndex == 1,
                                onChangeChannel = { pickerSlotIndex = 1 },
                                onFullscreen = { activeSlots.getOrNull(1)?.let(onNavigateFullscreen) },
                                modifier = Modifier.weight(1f).fillMaxHeight().padding(3.dp)
                            )
                        }
                        Row(modifier = Modifier.weight(1f).fillMaxWidth()) {
                            MultiViewSlot(
                                index = 2,
                                channel = activeSlots.getOrNull(2),
                                multiViewManager = multiViewManager,
                                isAudioActive = audioFocusIndex == 2,
                                onChangeChannel = { pickerSlotIndex = 2 },
                                onFullscreen = { activeSlots.getOrNull(2)?.let(onNavigateFullscreen) },
                                modifier = Modifier.weight(1f).fillMaxHeight().padding(3.dp)
                            )
                            MultiViewSlot(
                                index = 3,
                                channel = activeSlots.getOrNull(3),
                                multiViewManager = multiViewManager,
                                isAudioActive = audioFocusIndex == 3,
                                onChangeChannel = { pickerSlotIndex = 3 },
                                onFullscreen = { activeSlots.getOrNull(3)?.let(onNavigateFullscreen) },
                                modifier = Modifier.weight(1f).fillMaxHeight().padding(3.dp)
                            )
                        }
                    }
                }

                MultiViewLayout.DUAL -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        MultiViewSlot(
                            index = 0,
                            channel = activeSlots.getOrNull(0),
                            multiViewManager = multiViewManager,
                            isAudioActive = audioFocusIndex == 0,
                            onChangeChannel = { pickerSlotIndex = 0 },
                            onFullscreen = { activeSlots.getOrNull(0)?.let(onNavigateFullscreen) },
                            modifier = Modifier.weight(1f).fillMaxWidth().padding(3.dp)
                        )
                        MultiViewSlot(
                            index = 1,
                            channel = activeSlots.getOrNull(1),
                            multiViewManager = multiViewManager,
                            isAudioActive = audioFocusIndex == 1,
                            onChangeChannel = { pickerSlotIndex = 1 },
                            onFullscreen = { activeSlots.getOrNull(1)?.let(onNavigateFullscreen) },
                            modifier = Modifier.weight(1f).fillMaxWidth().padding(3.dp)
                        )
                    }
                }

                MultiViewLayout.SPOTLIGHT -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Spotlight Main Screen (70% height)
                        MultiViewSlot(
                            index = spotlightIndex,
                            channel = activeSlots.getOrNull(spotlightIndex),
                            multiViewManager = multiViewManager,
                            isAudioActive = audioFocusIndex == spotlightIndex,
                            onChangeChannel = { pickerSlotIndex = spotlightIndex },
                            onFullscreen = { activeSlots.getOrNull(spotlightIndex)?.let(onNavigateFullscreen) },
                            modifier = Modifier.weight(0.7f).fillMaxWidth().padding(3.dp)
                        )

                        // 3 Sub Screens in a bottom row (30% height)
                        Row(modifier = Modifier.weight(0.3f).fillMaxWidth()) {
                            val otherIndices = (0..3).filter { it != spotlightIndex }
                            otherIndices.forEach { otherIdx ->
                                MultiViewSlot(
                                    index = otherIdx,
                                    channel = activeSlots.getOrNull(otherIdx),
                                    multiViewManager = multiViewManager,
                                    isAudioActive = audioFocusIndex == otherIdx,
                                    onChangeChannel = { pickerSlotIndex = otherIdx },
                                    onFullscreen = { multiViewManager.setSpotlight(otherIdx) },
                                    modifier = Modifier.weight(1f).fillMaxHeight().padding(3.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(UnstableApi::class)
@Composable
private fun MultiViewSlot(
    index: Int,
    channel: ChannelItem?,
    multiViewManager: MultiViewManager,
    isAudioActive: Boolean,
    onChangeChannel: () -> Unit,
    onFullscreen: () -> Unit,
    modifier: Modifier = Modifier
) {
    val player = multiViewManager.players[index]
    val isLoading by player.isLoading.collectAsState()
    val error by player.errorMessage.collectAsState()

    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .border(
                width = if (isAudioActive) 2.dp else 1.dp,
                color = if (isAudioActive) AccentCyan else BorderDark,
                shape = RoundedCornerShape(8.dp)
            )
            .clickable {
                multiViewManager.setAudioFocus(index)
            },
        color = Color.Black
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // AndroidView wrapping PlayerView
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        useController = false
                        resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                        layoutParams = FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        this.player = player.exoPlayer
                    }
                },
                update = { pv ->
                    if (pv.player != player.exoPlayer) {
                        pv.player = player.exoPlayer
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // Loading Spinner
            if (isLoading && error == null) {
                CircularProgressIndicator(
                    modifier = Modifier.size(28.dp).align(Alignment.Center),
                    color = AccentCyan,
                    strokeWidth = 2.dp
                )
            }

            // Top Control Bar Overlay
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter),
                color = Color.Black.copy(alpha = 0.65f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (isAudioActive) SuccessEmerald else BorderDark,
                            modifier = Modifier.size(6.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${index + 1}. ${channel?.name ?: "No Channel"}",
                            color = TextPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Audio Toggle Icon
                        IconButton(
                            onClick = { multiViewManager.setAudioFocus(index) },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = if (isAudioActive) Icons.Default.VolumeUp else Icons.Default.VolumeOff,
                                contentDescription = "Audio",
                                tint = if (isAudioActive) AccentCyan else TextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Change Station Button
                        IconButton(
                            onClick = onChangeChannel,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = "Select Station",
                                tint = TextPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Fullscreen Button
                        IconButton(
                            onClick = onFullscreen,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Fullscreen,
                                contentDescription = "Fullscreen",
                                tint = TextPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
