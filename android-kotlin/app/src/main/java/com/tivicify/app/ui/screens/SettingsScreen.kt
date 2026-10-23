package com.tivicify.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tivicify.app.data.model.AppSettings
import com.tivicify.app.ui.components.ParentalPinDialog
import com.tivicify.app.ui.components.QrCodeDialog
import com.tivicify.app.ui.theme.*

@Composable
fun SettingsScreen(
    settings: AppSettings,
    onSettingsChanged: (AppSettings) -> Unit
) {
    var showQrDialog by remember { mutableStateOf(false) }
    var showPinDialog by remember { mutableStateOf(false) }
    var pinDialogPurpose by remember { mutableStateOf("") } // "kids" or "change_pin"

    if (showQrDialog) {
        QrCodeDialog(onDismiss = { showQrDialog = false })
    }

    if (showPinDialog) {
        ParentalPinDialog(
            correctPin = settings.parentalPin,
            title = if (pinDialogPurpose == "kids") "Unlock Kids Mode" else "Security PIN",
            onPinSuccess = {
                showPinDialog = false
                if (pinDialogPurpose == "kids") {
                    onSettingsChanged(settings.copy(kidsMode = !settings.kidsMode))
                }
            },
            onDismiss = { showPinDialog = false }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = "Settings & Preferences",
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary
        )
        Text(
            text = "Configure playback, network optimization, and TV mode",
            color = TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Install QR Code Banner
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { showQrDialog = true },
            shape = RoundedCornerShape(12.dp),
            color = SurfaceCard,
            border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryBlue.copy(alpha = 0.5f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = PrimaryBlue.copy(alpha = 0.2f),
                    modifier = Modifier.size(44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.QrCode2,
                            contentDescription = null,
                            tint = AccentCyan,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Scan QR to Install on Other Devices",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Instant phone, tablet, and Fire TV APK installer",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                }

                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Playback & Network Section
        SettingsGroupHeader(title = "Network & Bandwidth")

        SettingsToggleItem(
            icon = Icons.Default.SignalCellularAlt,
            title = "Data Saver Mode",
            subtitle = "Caps video resolution to 480p to prevent buffering on low-speed internet",
            checked = settings.lowBandwidthMode,
            onCheckedChange = { onSettingsChanged(settings.copy(lowBandwidthMode = it)) }
        )

        SettingsToggleItem(
            icon = Icons.Default.DownloadDone,
            title = "Aggressive Live Stream Prebuffering",
            subtitle = "Maintains 45-second forward cache buffer for zero stuttering",
            checked = true,
            onCheckedChange = {}
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Display & Controls Section
        SettingsGroupHeader(title = "Device & TV Controls")

        SettingsToggleItem(
            icon = Icons.Default.Tv,
            title = "Android TV / Remote Navigation",
            subtitle = "Optimizes spatial focus rings for TV remotes and Fire TV sticks",
            checked = settings.tvMode,
            onCheckedChange = { onSettingsChanged(settings.copy(tvMode = it)) }
        )

        SettingsToggleItem(
            icon = Icons.Default.ChildCare,
            title = "Kids Zone Mode",
            subtitle = "Locks UI strictly to Cartoon Network, Nickelodeon & family channels",
            checked = settings.kidsMode,
            onCheckedChange = {
                if (settings.enableParentalPin && settings.kidsMode) {
                    pinDialogPurpose = "kids"
                    showPinDialog = true
                } else {
                    onSettingsChanged(settings.copy(kidsMode = it))
                }
            }
        )

        Spacer(modifier = Modifier.height(20.dp))

        // About Section
        SettingsGroupHeader(title = "About Tivicify Native")

        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = SurfaceDark,
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("App Version", color = TextSecondary, fontSize = 13.sp)
                    Text("2.0.0 (Native Kotlin)", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Engine", color = TextSecondary, fontSize = 13.sp)
                    Text("Media3 ExoPlayer + HLS Multi-View", color = AccentCyan, fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Repository", color = TextSecondary, fontSize = 13.sp)
                    Text("tracktechapps/tivicify", color = TextPrimary, fontSize = 13.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}

@Composable
private fun SettingsGroupHeader(title: String) {
    Text(
        text = title,
        color = AccentCyan,
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(bottom = 8.dp)
    )
}

@Composable
private fun SettingsToggleItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(10.dp),
        color = SurfaceDark,
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = TextSecondary,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = subtitle,
                    color = TextSecondary,
                    fontSize = 11.sp
                )
            }

            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = PrimaryBlue,
                    uncheckedThumbColor = TextMuted,
                    uncheckedTrackColor = SurfaceCard
                )
            )
        }
    }
}
