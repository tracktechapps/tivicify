package com.tivicify.app.data.datasource

import com.tivicify.app.data.model.MediaItem
import com.tivicify.app.data.model.MediaType
import com.tivicify.app.data.model.StreamType

object CuratedMedia {
    val items: List<MediaItem> = listOf(
        MediaItem(
            id = "night-of-the-living-dead",
            title = "Night of the Living Dead",
            originalTitle = "George A. Romero's Masterpiece (1968)",
            description = "A disparate group of individuals seeks refuge in an abandoned farmhouse when corpses mysteriously begin rising from the dead and terrorizing the countryside.",
            type = MediaType.MOVIE,
            genres = listOf("Horror", "Cult Classic", "Sci-Fi"),
            posterUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
            streamUrl = "https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4",
            streamType = StreamType.MP4,
            year = 1968,
            duration = "1h 36m",
            rating = "8.9",
            isPublicDomain = true,
            director = "George A. Romero",
            cast = listOf("Duane Jones", "Judith O'Dea", "Karl Hardman", "Marilyn Eastman"),
            featured = true
        ),
        MediaItem(
            id = "charade-1963",
            title = "Charade",
            originalTitle = "Audrey Hepburn & Cary Grant (1963)",
            description = "A whirlwind romantic suspense comedy where a glamorous Parisian widow is pursued by several dangerous men who want a fortune stolen by her murdered husband.",
            type = MediaType.MOVIE,
            genres = listOf("Mystery", "Romance", "Comedy", "Thriller"),
            posterUrl = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80",
            streamUrl = "https://archive.org/download/Charade1963/Charade_512kb.mp4",
            streamType = StreamType.MP4,
            year = 1963,
            duration = "1h 53m",
            rating = "9.1",
            isPublicDomain = true,
            director = "Stanley Donen",
            cast = listOf("Cary Grant", "Audrey Hepburn", "Walter Matthau", "James Coburn"),
            featured = true
        ),
        MediaItem(
            id = "beverly-hillbillies-ep1",
            title = "The Beverly Hillbillies: The Clampetts Strike Oil",
            originalTitle = "Season 1, Episode 1",
            description = "Mountaineer Jed Clampett accidentally discovers crude oil on his land and becomes an overnight multimillionaire.",
            type = MediaType.TV,
            genres = listOf("Comedy", "Sitcom", "Classic TV"),
            posterUrl = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
            streamUrl = "https://archive.org/download/The_Beverly_Hillbillies/The_Clampets_Strike_Oil_512kb.mp4",
            streamType = StreamType.MP4,
            year = 1962,
            duration = "25m",
            rating = "8.6",
            isPublicDomain = true,
            director = "Richard Whorf",
            cast = listOf("Buddy Ebsen", "Irene Ryan", "Donna Douglas", "Max Baer Jr."),
            featured = true
        ),
        MediaItem(
            id = "nasa-moon-tour",
            title = "NASA: Tour of the Moon in 4K",
            description = "Breathtaking virtual tour of the Moon featuring ultra high-resolution data captured by the Lunar Reconnaissance Orbiter.",
            type = MediaType.DOCUMENTARY,
            genres = listOf("Documentary", "Space", "Science"),
            posterUrl = "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80",
            streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            streamType = StreamType.HLS,
            year = 2024,
            duration = "15m",
            rating = "9.2",
            isPublicDomain = true,
            director = "NASA Scientific Visualization Studio",
            featured = true
        )
    )
}
