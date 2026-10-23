package com.tivicify.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Home")
    object LiveTv : Screen("live_tv", "Live TV")
    object MultiView : Screen("multi_view", "Multi-View")
    object Recordings : Screen("recordings", "Recordings")
    object Settings : Screen("settings", "Settings")
    object Player : Screen("player/{itemId}/{itemType}", "Player") {
        fun createRoute(itemId: String, itemType: String = "channel"): String {
            return "player/$itemId/$itemType"
        }
    }
}
