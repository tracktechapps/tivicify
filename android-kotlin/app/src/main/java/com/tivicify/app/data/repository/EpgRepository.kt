package com.tivicify.app.data.repository

import com.tivicify.app.data.model.ChannelItem
import com.tivicify.app.data.model.EpgProgram
import java.util.Calendar

object EpgRepository {

    fun getEpgForChannel(channel: ChannelItem): Pair<EpgProgram, EpgProgram> {
        val nameLower = channel.name.lowercase()
        val catLower = channel.category.lowercase()

        val templates: List<String> = when {
            nameLower.contains("arise") -> listOf(
                "The Morning Show with Reuben Abati",
                "Arise NewsHour Live",
                "Prime Time News & Global Markets",
                "NewsNight Africa Focus"
            )
            nameLower.contains("ait") -> listOf(
                "Kakaaki: The African Voice",
                "AIT News at 8 Live",
                "Democracy Today & Governance",
                "Matters Arising"
            )
            nameLower.contains("channels") -> listOf(
                "Sunrise Daily Live",
                "Business Morning",
                "Politics Today with Seun Okinbaloye",
                "News at 10"
            )
            nameLower.contains("tvc") -> listOf(
                "TVC Breakfast Live",
                "Your View Lagos",
                "Journalists' Hangout",
                "TVC News at 10"
            )
            nameLower.contains("magic") || nameLower.contains("nollywood") -> listOf(
                "Nollywood Blockbuster: Prime Showcase",
                "Tinsel & African Dramatic Series",
                "African Magic Showcase Drama",
                "Late Night Mystery Cinema"
            )
            nameLower.contains("supersport") || nameLower.contains("fifa") || catLower.contains("sport") -> listOf(
                "Premier League Matchday Live",
                "World Football Highlights",
                "Championship Arena",
                "Sports Center Review"
            )
            catLower.contains("kid") || nameLower.contains("cartoon") -> listOf(
                "Toon Express & Classic Adventures",
                "Ben 10 & Teen Titans",
                "Looney Tunes Golden Era",
                "Bedtime Animation Tales"
            )
            catLower.contains("tech") || nameLower.contains("nasa") || nameLower.contains("discovery") -> listOf(
                "NASA Space Exploration Live",
                "Future Tech & AI Horizons",
                "How It's Made & Space Secrets",
                "Science Frontiers 360"
            )
            else -> listOf(
                "Universal Broadcast Network Live",
                "Global Showcase 24/7",
                "World In-Depth Feature",
                "Evening Bulletin"
            )
        }

        val cal = Calendar.getInstance()
        val currentHour = cal.get(Calendar.HOUR_OF_DAY)
        val currentMinute = cal.get(Calendar.MINUTE)
        val totalMinutes = currentHour * 60 + currentMinute

        var hash = 0
        channel.id.forEach { hash += it.code }

        val programIdx = ((totalMinutes + hash * 13) / 60) % templates.size
        val nextProgramIdx = (programIdx + 1) % templates.size

        val slotMinute = (totalMinutes + hash * 13) % 60
        val progressPercent = ((slotMinute.toFloat() / 60f) * 100f).toInt().coerceIn(5, 95)
        val remainingMinutes = (60 - slotMinute).coerceAtLeast(1)

        val startHour = currentHour % 24
        val endHour = (currentHour + 1) % 24

        fun formatHour(h: Int) = String.format("%02d:00", h)

        val currentProg = EpgProgram(
            title = channel.currentProgram ?: templates[programIdx],
            start = formatHour(startHour),
            end = formatHour(endHour),
            description = channel.epgDescription ?: "Live 24/7 continuous broadcast in high definition.",
            progressPercent = progressPercent,
            remainingMinutes = remainingMinutes
        )

        val nextProg = EpgProgram(
            title = templates[nextProgramIdx],
            start = formatHour(endHour),
            end = formatHour((endHour + 1) % 24),
            description = "Upcoming scheduled broadcast.",
            progressPercent = 0,
            remainingMinutes = 60
        )

        return Pair(currentProg, nextProg)
    }
}
