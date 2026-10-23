package com.tivicify.app.data.datasource

import com.tivicify.app.data.model.ChannelItem

object CuratedChannels {
    val channels: List<ChannelItem> = listOf(
        // --- NIGERIAN & AFRICAN PREMIUM LIVE TV ---
        ChannelItem(
            id = "ch-ng-arise-news",
            name = "Arise News HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e4/Arise_News_logo.png",
            streamUrl = "https://live20.bozztv.com/dvrfl06/astv/astv-arise/index.m3u8",
            category = "News",
            country = "Nigeria 🇳🇬",
            currentProgram = "The Morning Show with Reuben Abati",
            epgDescription = "Premier international news broadcasting live from Lagos, Abuja, London and New York with in-depth African analysis.",
            channelNumber = 101
        ),
        ChannelItem(
            id = "ch-ng-ait",
            name = "AIT Live (Africa Independent TV)",
            logoUrl = "https://upload.wikimedia.org/wikipedia/en/2/25/AIT_Logo.jpg",
            streamUrl = "https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_001/Stream/playlist.m3u8",
            category = "News",
            country = "Nigeria 🇳🇬",
            currentProgram = "Kakaaki: The African Voice",
            epgDescription = "Nigeria's pioneer independent television network covering politics, national affairs, culture, and drama.",
            channelNumber = 102
        ),
        ChannelItem(
            id = "ch-ng-channels-tv",
            name = "Channels TV HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/en/7/76/Channels_TV.jpg",
            streamUrl = "https://cs2.push2stream.com/CHANNELSTV-DVR/playlist.m3u8",
            category = "News",
            country = "Nigeria 🇳🇬",
            currentProgram = "Politics Today & News at 10",
            epgDescription = "Multi-award-winning 24/7 Nigerian news station providing balanced national reporting and investigative journalism.",
            channelNumber = 103
        ),
        ChannelItem(
            id = "ch-ng-tvc-news",
            name = "TVC News Nigeria HD",
            logoUrl = "https://i.imgur.com/ReV8R5S.png",
            streamUrl = "https://tvce.gridpapaservers.com/TVCSEPT/ngrp:myStream_all/playlist.m3u8",
            category = "News",
            country = "Nigeria 🇳🇬",
            currentProgram = "TVC Breakfast & Journalists' Hangout",
            epgDescription = "Live 24-hour Nigerian and African news, breaking headlines, business, and investigative reporting from Lagos.",
            channelNumber = 104
        ),
        ChannelItem(
            id = "ch-ng-ontv",
            name = "ONTV Nigeria",
            logoUrl = "https://i.imgur.com/fKtPcT4.png",
            streamUrl = "https://cs2.push2stream.com/SOUNDCITY/playlist.m3u8",
            category = "Entertainment",
            country = "Nigeria 🇳🇬",
            currentProgram = "ONTV Drive & Lagos Lifestyle",
            epgDescription = "Leading terrestrial and cable entertainment channel featuring daily soaps, movies, music, fashion, and urban lifestyle.",
            channelNumber = 105
        ),
        ChannelItem(
            id = "ch-ng-rave-tv",
            name = "Rave TV Lagos",
            logoUrl = "https://i.imgur.com/pXKQE0G.png",
            streamUrl = "https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_039/Stream/playlist.m3u8",
            category = "Entertainment",
            country = "Nigeria 🇳🇬",
            currentProgram = "City Pulse Lagos & Youth Culture",
            epgDescription = "Interactive, youth-oriented entertainment and lifestyle television station.",
            channelNumber = 106
        ),
        ChannelItem(
            id = "ch-ng-africa-magic",
            name = "Africa Magic Showcase & Nollywood HD",
            logoUrl = "https://i.imgur.com/ojLIfkt.jpeg",
            streamUrl = "https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_011/Stream/playlist.m3u8",
            category = "Movies",
            country = "Nigeria 🇳🇬",
            currentProgram = "Nollywood Blockbusters, Drama & Tinsel",
            epgDescription = "The home of African storytelling, celebrated Nollywood cinematic movies, romantic dramas, comedies and gripping African series.",
            channelNumber = 107
        ),
        ChannelItem(
            id = "ch-supersport-sports",
            name = "SuperSport Sports Zone & Football Live",
            logoUrl = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=128&q=80",
            streamUrl = "https://amg01076-redbull-redbulltv-samsungau-440ba.amagi.tv/playlist/amg01076-redbull-redbulltv-samsungau/playlist.m3u8",
            category = "Sports",
            country = "Sports ⚽",
            currentProgram = "Premier Football Matchday & World Sports Live",
            epgDescription = "24/7 sports action: international football tournaments, athletics, extreme sports, highlights and championship analysis.",
            channelNumber = 108
        ),
        ChannelItem(
            id = "ch-fifa-sports",
            name = "FIFA+ Live Football Channel",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/1/10/FIFA_logo_without_slogan.svg",
            streamUrl = "https://fifa-fifaplus1-1-au.samsung.wurl.tv/playlist.m3u8",
            category = "Sports",
            country = "Sports ⚽",
            currentProgram = "World Cup Rewind & International Live Matches",
            epgDescription = "Official FIFA channel streaming world championship football archives, live domestic league matches, and player documentaries.",
            channelNumber = 109
        ),
        ChannelItem(
            id = "ch-ng-waptv",
            name = "Wap TV Nigeria (Wale Adenuga)",
            logoUrl = "https://i.imgur.com/Djng8pI.png",
            streamUrl = "https://newproxy3.vidivu.tv/waptv/index.m3u8",
            category = "Entertainment",
            country = "Nigeria 🇳🇬",
            currentProgram = "Papa Ajasco & Company, Akpan & Oduma",
            epgDescription = "Popular indigenous family entertainment network showcasing Papa Ajasco comedy, Nollywood drama, and Nigerian cultural shows.",
            channelNumber = 110
        ),
        ChannelItem(
            id = "ch-ng-soundcity",
            name = "Soundcity TV Nigeria",
            logoUrl = "https://i.imgur.com/fKtPcT4.png",
            streamUrl = "https://cs2.push2stream.com/SOUNDCITY/playlist.m3u8",
            category = "Music",
            country = "Nigeria 🇳🇬",
            currentProgram = "Top 10 Nigeria Countdown & Afrobeats 24/7",
            epgDescription = "Pan-African music and lifestyle channel delivering non-stop music videos, artist interviews, and awards.",
            channelNumber = 111
        ),
        ChannelItem(
            id = "ch-ng-silverbird",
            name = "Silverbird News 24",
            logoUrl = "https://i.imgur.com/9jcV9oG.png",
            streamUrl = "https://viewmedia7219.bozztv.com/wmedia/viewmedia100/web_029/Stream/playlist.m3u8",
            category = "News",
            country = "Nigeria 🇳🇬",
            currentProgram = "Silverbird Live Bulletin & Business Today",
            epgDescription = "Premier Nigerian 24-hour national and African international news network.",
            channelNumber = 112
        ),
        ChannelItem(
            id = "ch-ng-nta-intl",
            name = "NTA International News 24",
            logoUrl = "https://i.imgur.com/mN8j8CR.png",
            streamUrl = "https://api.visionip.tv/live/ASHTTP/visiontvuk-entertainment-ntai-hsslive-25f-4x3-MB/playlist.m3u8",
            category = "News",
            country = "Nigeria 🇳🇬",
            currentProgram = "Network News at 9 & Federal Perspectives",
            epgDescription = "Official Nigerian national broadcaster delivering nationwide news, culture, government policy, and traditional heritage.",
            channelNumber = 113
        ),

        // --- KID ZONE & CARTOONS ---
        ChannelItem(
            id = "ch-cartoon-network",
            name = "Cartoon Network (India)",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg",
            streamUrl = "https://drk6xq0vhn.gpcdn.net/live/cn_sd_abr/index.m3u8",
            category = "Kids",
            country = "Kid Zone 👶",
            currentProgram = "Ben 10, Teen Titans & Classic Toons",
            epgDescription = "Non-stop top-rated animation series, adventures, and cartoons for children of all ages.",
            channelNumber = 201
        ),
        ChannelItem(
            id = "ch-cartoon-classics",
            name = "Cartoon Classics 24/7",
            logoUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=128&q=80",
            streamUrl = "https://daiconnect.com/live/hls/tvup/rk-cartoonclassics/578f4b7eb725168349ec0af81b21d388/index.m3u8",
            category = "Kids",
            country = "Kid Zone 👶",
            currentProgram = "Looney Tunes, Popeye & Vintage Cartoons",
            epgDescription = "Timeless classic animation, Popeye, Betty Boop, and Golden Age animated shorts restored.",
            channelNumber = 202
        ),
        ChannelItem(
            id = "ch-abc-kids",
            name = "ABC Kids TV Zone",
            logoUrl = "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=128&q=80",
            streamUrl = "https://c.mjh.nz/abc-kids.m3u8",
            category = "Kids",
            country = "Kid Zone 👶",
            currentProgram = "Preschool Learning & Animated Adventures",
            epgDescription = "Safe, educational, award-winning programs designed for young children and families.",
            channelNumber = 203
        ),

        // --- TECH, SCIENCE & EXPLORATION ---
        ChannelItem(
            id = "ch-discovery-channel",
            name = "Discovery Channel HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/23/Discovery_Channel_logo_2019.svg",
            streamUrl = "https://streaming.aurora.enhanced.live/live/mpc/enl0eG1mLmVncmVzcy5mZDJ2eHI=/out/v1/IT_SIMULCAST/DISCOVERYCHANNEL/CMAF/index.m3u8",
            category = "Tech",
            country = "Tech & Science 🔬",
            currentProgram = "Mythbusters & Modern Engineering",
            epgDescription = "Premier international science and technology network exploring modern innovation and wildlife.",
            channelNumber = 301
        ),
        ChannelItem(
            id = "ch-discovery-science",
            name = "Discovery Science HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/4/4e/Discovery_Science_logo_2017.svg",
            streamUrl = "https://drk6xq0vhn.gpcdn.net/live/discovery_science_abr/index.m3u8",
            category = "Tech",
            country = "Tech & Science 🔬",
            currentProgram = "How It's Made & Space Mysteries",
            epgDescription = "In-depth tech documentaries, futuristic robotics, physics breakthroughs, and cosmos explorations.",
            channelNumber = 302
        ),
        ChannelItem(
            id = "ch-nasa-hd",
            name = "NASA TV HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg",
            streamUrl = "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
            category = "Tech",
            country = "USA / Tech 🚀",
            currentProgram = "Live ISS Feed & Artemis Deep Space",
            epgDescription = "Continuous high definition live space exploration, rocket launches, and spacewalks from NASA.",
            channelNumber = 303
        ),

        // --- GLOBAL NEWS ---
        ChannelItem(
            id = "ch-aljazeera-en",
            name = "Al Jazeera English HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/en/f/f2/Al_Jazeera_English_logo.svg",
            streamUrl = "https://live-hls-web-aje.getaj.net/AJE/03.m3u8",
            category = "News",
            country = "Global 🌍",
            currentProgram = "NewsHour Live & Inside Story",
            epgDescription = "Global international news channel broadcasting unbiased reporting from the Middle East, Africa, and beyond.",
            channelNumber = 401
        ),
        ChannelItem(
            id = "ch-sky-news",
            name = "Sky News UK",
            logoUrl = "https://upload.wikimedia.org/wikipedia/en/3/30/Sky_News_logo_2015.svg",
            streamUrl = "https://skynews-live.akamaized.net/hls/live/2011550/skynews_live1/index.m3u8",
            category = "News",
            country = "UK 🇬🇧",
            currentProgram = "Sky News at Ten & Global View",
            epgDescription = "Award-winning continuous news broadcasting from London and around the globe.",
            channelNumber = 402
        ),
        ChannelItem(
            id = "ch-dw-english",
            name = "DW News 24/7",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/7/75/Deutsche_Welle_symbol_2012.svg",
            streamUrl = "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
            category = "News",
            country = "Germany 🇩🇪",
            currentProgram = "Global NewsHour & Business Insights",
            epgDescription = "Germany international broadcaster delivering worldwide news and investigative reports in English.",
            channelNumber = 403
        ),
        ChannelItem(
            id = "ch-france24-en",
            name = "France 24 HD",
            logoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/23/France24_2013_logo.svg",
            streamUrl = "https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8",
            category = "News",
            country = "France 🇫🇷",
            currentProgram = "The World This Week",
            epgDescription = "French international news network covering global perspectives from Paris.",
            channelNumber = 404
        )
    )
}
