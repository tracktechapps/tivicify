package com.tivicify.app.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.tivicify.app.data.model.ChannelItem
import com.tivicify.app.data.model.MediaItem
import com.tivicify.app.data.repository.MediaRepository
import com.tivicify.app.data.repository.TvRepository
import com.tivicify.app.ui.components.ChannelCard
import com.tivicify.app.ui.components.MediaPosterCard
import com.tivicify.app.ui.components.QrCodeDialog
import com.tivicify.app.ui.theme.*

@Composable
fun HomeScreen(
    tvRepository: TvRepository,
    mediaRepository: MediaRepository,
    onChannelClick: (ChannelItem) -> Unit,
    onMediaClick: (MediaItem) -> Unit,
    onNavigateMultiView: () -> Unit,
    onNavigateLiveTv: () -> Unit
) {
    val channels by tvRepository.channels.collectAsState()
    val mediaItems by mediaRepository.items.collectAsState()

    var showQrDialog by remember { mutableStateOf(false) }

    val nigerianChannels = remember(channels) {
        channels.filter { it.country.equals("Nigeria", ignoreCase = true) }
    }
    val sportsChannels = remember(channels) {
        channels.filter { it.category.contains("Sports", ignoreCase = true) }
    }
    val movies = remember(mediaItems) {
        mediaRepository.getMovies()
    }
    val shows = remember(mediaItems) {
        mediaRepository.getShows()
    }
    val documentaries = remember(mediaItems) {
        mediaRepository.getDocumentaries()
    }

    val heroChannel = nigerianChannels.firstOrNull() ?: channels.firstOrNull()

    if (showQrDialog) {
        QrCodeDialog(onDismiss = { showQrDialog = false })
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Hero Live Banner
        if (heroChannel != null) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(280.dp)
                ) {
                    // Hero backdrop / logo
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(SurfaceDark)
                    ) {
                        if (!heroChannel.logoUrl.isNullOrEmpty()) {
                            AsyncImage(
                                model = heroChannel.logoUrl,
                                contentDescription = heroChannel.name,
                                contentScale = ContentScale.Fit,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(40.dp)
                            )
                        }
                    }

                    // Gradients
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        BackgroundDark.copy(alpha = 0.4f),
                                        BackgroundDark.copy(alpha = 0.85f),
                                        BackgroundDark
                                    )
                                )
                            )
                    )

                    // Hero Content
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(16.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = LiveRed,
                                modifier = Modifier.padding(end = 8.dp)
                            ) {
                                Text(
                                    text = "SPOTLIGHT LIVE",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Text(
                                text = "🇳🇬 Nigerian National Broadcast",
                                color = AccentCyan,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = heroChannel.name,
                            style = MaterialTheme.typography.headlineLarge,
                            color = TextPrimary
                        )

                        Text(
                            text = heroChannel.currentProgram ?: heroChannel.epgDescription ?: "Continuous Live Broadcast & Breaking News Coverage",
                            color = TextSecondary,
                            fontSize = 13.sp,
                            maxLines = 2,
                            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                        )

                        // Action Buttons
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = { onChannelClick(heroChannel) },
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Tune In Live", fontWeight = FontWeight.Bold)
                            }

                            OutlinedButton(
                                onClick = onNavigateMultiView,
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = AccentCyan),
                                border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.GridView, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Multi-View 4-Screen")
                            }

                            IconButton(
                                onClick = { showQrDialog = true },
                                modifier = Modifier
                                    .size(40.dp)
                                    .background(SurfaceCard, RoundedCornerShape(8.dp))
                            ) {
                                Icon(Icons.Default.QrCode2, contentDescription = "QR Code", tint = AccentCyan)
                            }
                        }
                    }
                }
            }
        }

        // Section: Nigeria Live TV Spotlight
        item {
            SectionHeader(
                title = "🇳🇬 Nigerian Premium Channels",
                subtitle = "Arise HD, AIT Live, Channels TV, TVC, Africa Magic, ONTV",
                onSeeAll = onNavigateLiveTv
            )
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(nigerianChannels) { channel ->
                    ChannelCard(
                        channel = channel,
                        onClick = { onChannelClick(channel) },
                        modifier = Modifier.width(170.dp)
                    )
                }
            }
        }

        // Section: Sports Zone
        if (sportsChannels.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(20.dp))
                SectionHeader(
                    title = "⚽ Sports Live Zone",
                    subtitle = "SuperSport, FIFA+, RedBull TV, Extreme Sports",
                    onSeeAll = onNavigateLiveTv
                )
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(sportsChannels) { channel ->
                        ChannelCard(
                            channel = channel,
                            onClick = { onChannelClick(channel) },
                            modifier = Modifier.width(170.dp)
                        )
                    }
                }
            }
        }

        // Section: Classic Movies
        if (movies.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(20.dp))
                SectionHeader(
                    title = "🍿 Movies & Feature Films",
                    subtitle = "Stream anytime on-demand with zero buffering",
                    onSeeAll = null
                )
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(movies) { item ->
                        MediaPosterCard(
                            item = item,
                            onClick = { onMediaClick(item) }
                        )
                    }
                }
            }
        }

        // Section: Comedy & Series
        if (shows.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(20.dp))
                SectionHeader(
                    title = "📺 Shows, Comedy & Series",
                    subtitle = "Classic sitcoms, animated specials, and episodic series",
                    onSeeAll = null
                )
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(shows) { item ->
                        MediaPosterCard(
                            item = item,
                            onClick = { onMediaClick(item) }
                        )
                    }
                }
            }
        }

        // Section: Documentaries
        if (documentaries.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(20.dp))
                SectionHeader(
                    title = "🚀 Science, Tech & Documentaries",
                    subtitle = "NASA Ultra HD, deep space exploration, and discoveries",
                    onSeeAll = null
                )
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(documentaries) { item ->
                        MediaPosterCard(
                            item = item,
                            onClick = { onMediaClick(item) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(
    title: String,
    subtitle: String,
    onSeeAll: (() -> Unit)?
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = TextPrimary,
                fontSize = 17.sp
            )
            Text(
                text = subtitle,
                color = TextSecondary,
                fontSize = 12.sp
            )
        }
        if (onSeeAll != null) {
            TextButton(onClick = onSeeAll) {
                Text("See All", color = AccentCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
