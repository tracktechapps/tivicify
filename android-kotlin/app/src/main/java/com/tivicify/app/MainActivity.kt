package com.tivicify.app

import android.os.Bundle
import android.view.KeyEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.tivicify.app.data.model.AppSettings
import com.tivicify.app.data.repository.MediaRepository
import com.tivicify.app.data.repository.RecordingsRepository
import com.tivicify.app.data.repository.TvRepository
import com.tivicify.app.ui.navigation.Screen
import com.tivicify.app.ui.screens.*
import com.tivicify.app.ui.theme.*

class MainActivity : ComponentActivity() {

    private val tvRepository = TvRepository()
    private val mediaRepository = MediaRepository()
    private val recordingsRepository = RecordingsRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            TivicifyTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                var appSettings by remember { mutableStateOf(AppSettings()) }

                // Hide bottom navigation bar when viewing fullscreen player
                val isPlayerRoute = currentRoute?.startsWith("player") == true

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = BackgroundDark,
                    bottomBar = {
                        AnimatedVisibility(
                            visible = !isPlayerRoute,
                            enter = slideInVertically(initialOffsetY = { it }),
                            exit = slideOutVertically(targetOffsetY = { it })
                        ) {
                            NavigationBar(
                                containerColor = SurfaceDark,
                                contentColor = TextPrimary,
                                tonalElevation = 8.dp
                            ) {
                                val navItems = listOf(
                                    NavigationItem(Screen.Home.route, "Home", Icons.Default.Home),
                                    NavigationItem(Screen.LiveTv.route, "Live TV", Icons.Default.Tv),
                                    NavigationItem(Screen.MultiView.route, "Multi-View", Icons.Default.GridView),
                                    NavigationItem(Screen.Recordings.route, "Recordings", Icons.Default.Videocam),
                                    NavigationItem(Screen.Settings.route, "Settings", Icons.Default.Settings)
                                )

                                navItems.forEach { item ->
                                    val isSelected = currentRoute == item.route
                                    NavigationBarItem(
                                        selected = isSelected,
                                        onClick = {
                                            navController.navigate(item.route) {
                                                popUpTo(navController.graph.findStartDestination().id) {
                                                    saveState = true
                                                }
                                                launchSingleTop = true
                                                restoreState = true
                                            }
                                        },
                                        icon = {
                                            Icon(
                                                imageVector = item.icon,
                                                contentDescription = item.label,
                                                tint = if (isSelected) AccentCyan else TextSecondary
                                            )
                                        },
                                        label = {
                                            Text(
                                                text = item.label,
                                                color = if (isSelected) AccentCyan else TextSecondary,
                                                fontSize = 11.sp
                                            )
                                        },
                                        colors = NavigationBarItemDefaults.colors(
                                            indicatorColor = PrimaryBlue.copy(alpha = 0.2f)
                                        )
                                    )
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Home.route) {
                            HomeScreen(
                                tvRepository = tvRepository,
                                mediaRepository = mediaRepository,
                                onChannelClick = { channel ->
                                    navController.navigate(Screen.Player.createRoute(channel.id, "channel"))
                                },
                                onMediaClick = { media ->
                                    navController.navigate(Screen.Player.createRoute(media.id, "media"))
                                },
                                onNavigateMultiView = {
                                    navController.navigate(Screen.MultiView.route)
                                },
                                onNavigateLiveTv = {
                                    navController.navigate(Screen.LiveTv.route)
                                }
                            )
                        }

                        composable(Screen.LiveTv.route) {
                            LiveTvScreen(
                                tvRepository = tvRepository,
                                onChannelClick = { channel ->
                                    navController.navigate(Screen.Player.createRoute(channel.id, "channel"))
                                },
                                onNavigateMultiView = {
                                    navController.navigate(Screen.MultiView.route)
                                }
                            )
                        }

                        composable(Screen.MultiView.route) {
                            MultiViewScreen(
                                tvRepository = tvRepository,
                                onNavigateFullscreen = { channel ->
                                    navController.navigate(Screen.Player.createRoute(channel.id, "channel"))
                                }
                            )
                        }

                        composable(Screen.Recordings.route) {
                            RecordingsScreen(
                                recordingsRepository = recordingsRepository,
                                onPlayRecording = { recording ->
                                    navController.navigate(Screen.Player.createRoute(recording.id, "recording"))
                                }
                            )
                        }

                        composable(Screen.Settings.route) {
                            SettingsScreen(
                                settings = appSettings,
                                onSettingsChanged = { appSettings = it }
                            )
                        }

                        composable(
                            route = Screen.Player.route,
                            arguments = listOf(
                                navArgument("itemId") { type = NavType.StringType },
                                navArgument("itemType") { type = NavType.StringType }
                            )
                        ) { backStackEntry ->
                            val itemId = backStackEntry.arguments?.getString("itemId") ?: ""
                            val itemType = backStackEntry.arguments?.getString("itemType") ?: "channel"

                            PlayerScreen(
                                itemId = itemId,
                                itemType = itemType,
                                tvRepository = tvRepository,
                                mediaRepository = mediaRepository,
                                recordingsRepository = recordingsRepository,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // TV remote back key handling
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            return super.onKeyDown(keyCode, event)
        }
        return super.onKeyDown(keyCode, event)
    }
}

private data class NavigationItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)
