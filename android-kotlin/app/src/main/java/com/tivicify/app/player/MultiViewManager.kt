package com.tivicify.app.player

import android.content.Context
import com.tivicify.app.data.model.ChannelItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class MultiViewLayout {
    SPOTLIGHT, // 1 large main screen + 3 compact mini screens
    DUAL,      // 2 screens (2x1)
    QUAD       // 4 screens (2x2)
}

class MultiViewManager(private val context: Context) {

    private val _layout = MutableStateFlow(MultiViewLayout.QUAD)
    val layout: StateFlow<MultiViewLayout> = _layout.asStateFlow()

    private val _audioFocusIndex = MutableStateFlow(0)
    val audioFocusIndex: StateFlow<Int> = _audioFocusIndex.asStateFlow()

    private val _spotlightIndex = MutableStateFlow(0)
    val spotlightIndex: StateFlow<Int> = _spotlightIndex.asStateFlow()

    private val _slots = MutableStateFlow<List<ChannelItem>>(emptyList())
    val slots: StateFlow<List<ChannelItem>> = _slots.asStateFlow()

    val players = Array(4) { TivicifyPlayer(context) }

    fun initialize(initialChannels: List<ChannelItem>) {
        val initialSlots = mutableListOf<ChannelItem>()
        for (i in 0 until 4) {
            if (i < initialChannels.size) {
                initialSlots.add(initialChannels[i])
            } else if (initialChannels.isNotEmpty()) {
                initialSlots.add(initialChannels[0])
            }
        }
        _slots.value = initialSlots

        for (i in 0 until 4) {
            players[i].initialize()
            // Only player 0 has audio on by default
            players[i].setMuted(i != 0)
            initialSlots.getOrNull(i)?.let {
                players[i].playStream(it.streamUrl)
            }
        }
    }

    fun setAudioFocus(index: Int) {
        if (index !in 0 until 4) return
        _audioFocusIndex.value = index
        for (i in 0 until 4) {
            players[i].setMuted(i != index)
        }
    }

    fun setSpotlight(index: Int) {
        if (index !in 0 until 4) return
        _spotlightIndex.value = index
        setAudioFocus(index)
    }

    fun setLayout(newLayout: MultiViewLayout) {
        _layout.value = newLayout
    }

    fun setChannelForSlot(slotIndex: Int, channel: ChannelItem) {
        if (slotIndex !in 0 until 4) return
        val current = _slots.value.toMutableList()
        if (slotIndex < current.size) {
            current[slotIndex] = channel
        } else {
            current.add(channel)
        }
        _slots.value = current
        players[slotIndex].playStream(channel.streamUrl)
    }

    fun release() {
        for (p in players) {
            p.release()
        }
    }
}
