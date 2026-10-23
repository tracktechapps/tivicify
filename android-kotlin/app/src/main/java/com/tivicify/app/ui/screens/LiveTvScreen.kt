package com.tivicify.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.tivicify.app.data.model.ChannelItem
import com.tivicify.app.data.repository.EpgRepository
import com.tivicify.app.data.repository.TvRepository
import com.tivicify.app.ui.components.ChannelCard
import com.tivicify.app.ui.components.EpgRowItem
import com.tivicify.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LiveTvScreen(
    tvRepository: TvRepository,
    onChannelClick: (ChannelItem) -> Unit,
    onNavigateMultiView: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val channels by tvRepository.channels.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var isEpgView by remember { mutableStateOf(false) }
    var isDataSaverEnabled by remember { mutableStateOf(false) }
    var showImportDialog by remember { mutableStateOf(false) }
    var importUrl by remember { mutableStateOf("") }
    var importStatusMessage by remember { mutableStateOf<String?>(null) }
    var isImporting by remember { mutableStateOf(false) }

    val categories = listOf(
        "All",
        "Nigeria 🇳🇬",
        "News",
        "Sports",
        "Cartoons & Kids",
        "Tech & Science",
        "Entertainment",
        "Documentary"
    )

    val filteredChannels = remember(channels, searchQuery, selectedCategory) {
        channels.filter { ch ->
            val matchesSearch = searchQuery.isEmpty() ||
                    ch.name.contains(searchQuery, ignoreCase = true) ||
                    ch.category.contains(searchQuery, ignoreCase = true) ||
                    (ch.country?.contains(searchQuery, ignoreCase = true) == true) ||
                    (ch.currentProgram?.contains(searchQuery, ignoreCase = true) == true)

            val matchesCategory = when (selectedCategory) {
                "All" -> true
                "Nigeria 🇳🇬" -> ch.country.equals("Nigeria", ignoreCase = true)
                "Cartoons & Kids" -> ch.category.contains("Cartoon", ignoreCase = true) || ch.category.contains("Kids", ignoreCase = true)
                "Tech & Science" -> ch.category.contains("Tech", ignoreCase = true) || ch.category.contains("Science", ignoreCase = true)
                else -> ch.category.contains(selectedCategory, ignoreCase = true)
            }

            matchesSearch && matchesCategory
        }
    }

    // M3U Playlist Import Dialog
    if (showImportDialog) {
        Dialog(onDismissRequest = { showImportDialog = false }) {
            Surface(
                modifier = Modifier.width(360.dp),
                shape = RoundedCornerShape(16.dp),
                color = SurfaceDark,
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Import M3U Playlist",
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary,
                        fontSize = 18.sp
                    )
                    Text(
                        text = "Enter any M3U or M3U8 IPTV URL (e.g., from iptv-org or free-tv)",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = importUrl,
                        onValueChange = { importUrl = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("https://iptv-org.github.io/iptv/index.m3u", color = TextMuted, fontSize = 12.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentCyan,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedContainerColor = BackgroundDark,
                            unfocusedContainerColor = BackgroundDark
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    if (importStatusMessage != null) {
                        Text(
                            text = importStatusMessage ?: "",
                            color = AccentCyan,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { showImportDialog = false }) {
                            Text("Cancel", color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                if (importUrl.isNotBlank()) {
                                    isImporting = true
                                    importStatusMessage = "Downloading and parsing playlist..."
                                    coroutineScope.launch {
                                        val result = tvRepository.importM3uPlaylist(importUrl.trim())
                                        isImporting = false
                                        if (result.isSuccess) {
                                            val count = result.getOrNull() ?: 0
                                            importStatusMessage = "Successfully imported $count channels!"
                                        } else {
                                            importStatusMessage = "Import failed: ${result.exceptionOrNull()?.localizedMessage}"
                                        }
                                    }
                                }
                            },
                            enabled = !isImporting && importUrl.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(if (isImporting) "Importing..." else "Import", color = Color.White)
                        }
                    }
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        // Top Bar: Search + View Toggles + Data Saver
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceDark)
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Live TV Stations",
                        style = MaterialTheme.typography.headlineMedium,
                        color = TextPrimary
                    )
                    Text(
                        text = "${filteredChannels.size} Channels Available",
                        color = AccentCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    // Data Saver Toggle
                    IconButton(
                        onClick = { isDataSaverEnabled = !isDataSaverEnabled },
                        modifier = Modifier
                            .size(36.dp)
                            .background(
                                if (isDataSaverEnabled) SuccessEmerald.copy(alpha = 0.2f) else SurfaceCard,
                                RoundedCornerShape(8.dp)
                            )
                    ) {
                        Icon(
                            imageVector = Icons.Default.SignalCellularAlt,
                            contentDescription = "Data Saver",
                            tint = if (isDataSaverEnabled) SuccessEmerald else TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Import M3U
                    IconButton(
                        onClick = { showImportDialog = true },
                        modifier = Modifier
                            .size(36.dp)
                            .background(SurfaceCard, RoundedCornerShape(8.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.AddLink,
                            contentDescription = "Import M3U",
                            tint = AccentCyan,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // MultiView Quick Launch
                    IconButton(
                        onClick = onNavigateMultiView,
                        modifier = Modifier
                            .size(36.dp)
                            .background(PrimaryBlue.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.GridView,
                            contentDescription = "Multi-View",
                            tint = PrimaryBlue,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // View Switcher (Grid vs EPG)
                    IconButton(
                        onClick = { isEpgView = !isEpgView },
                        modifier = Modifier
                            .size(36.dp)
                            .background(SurfaceCard, RoundedCornerShape(8.dp))
                    ) {
                        Icon(
                            imageVector = if (isEpgView) Icons.Default.CalendarViewWeek else Icons.Default.ViewAgenda,
                            contentDescription = "Switch View",
                            tint = AccentCyan,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search Nigerian channels, News, Sports, Cartoons...", color = TextMuted, fontSize = 13.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = AccentCyan
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear", tint = TextSecondary)
                        }
                    }
                },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentCyan,
                    unfocusedBorderColor = BorderDark,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedContainerColor = BackgroundDark,
                    unfocusedContainerColor = BackgroundDark
                ),
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Category Chips Row
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categories) { cat ->
                    val isSelected = cat == selectedCategory
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, fontSize = 12.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBlue,
                            selectedLabelColor = Color.White,
                            containerColor = SurfaceCard,
                            labelColor = TextSecondary
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) PrimaryBlue else BorderDark
                        )
                    )
                }
            }
        }

        // Channels Display (Grid or EPG)
        if (filteredChannels.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.SearchOff,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No channels match \"$searchQuery\"",
                        color = TextSecondary,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    TextButton(onClick = { searchQuery = ""; selectedCategory = "All" }) {
                        Text("Reset Filters", color = AccentCyan)
                    }
                }
            }
        } else if (isEpgView) {
            // Live EPG Timetable List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredChannels, key = { it.id }) { channel ->
                    val (current, next) = EpgRepository.getEpgForChannel(channel)

                    EpgRowItem(
                        channel = channel,
                        currentProgram = current,
                        upcomingPrograms = listOf(next),
                        onTuneIn = { onChannelClick(channel) }
                    )
                }
            }
        } else {
            // Responsive Grid View (Phones, Tablets & TV)
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 155.dp),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredChannels, key = { it.id }) { channel ->
                    ChannelCard(
                        channel = channel,
                        onClick = { onChannelClick(channel) }
                    )
                }
            }
        }
    }
}
