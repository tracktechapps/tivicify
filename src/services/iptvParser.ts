import { ChannelItem } from '../types';

export function parseM3UPlaylist(content: string): ChannelItem[] {
  const lines = content.split(/\r?\n/);
  const channels: ChannelItem[] = [];

  let currentChannel: Partial<ChannelItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};

      // Parse metadata from EXTINF line
      // Example: #EXTINF:-1 tvg-id="CNN" tvg-name="CNN US" tvg-logo="https://..." group-title="News",CNN USA HD
      const tvgNameMatch = line.match(/tvg-name="([^"]+)"/i);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupTitleMatch = line.match(/group-title="([^"]+)"/i);

      // Channel name after the last comma
      const commaIndex = line.lastIndexOf(',');
      let channelName = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : '';

      if (!channelName && tvgNameMatch) {
        channelName = tvgNameMatch[1];
      }

      currentChannel.name = channelName || 'Untitled Channel';
      currentChannel.logoUrl = tvgLogoMatch ? tvgLogoMatch[1] : undefined;
      currentChannel.category = groupTitleMatch ? groupTitleMatch[1] : 'General';
      currentChannel.id = 'iptv-' + Math.random().toString(36).substring(2, 9);
    } else if (!line.startsWith('#') && (line.startsWith('http://') || line.startsWith('https://') || line.endsWith('.m3u8') || line.endsWith('.ts'))) {
      if (currentChannel) {
        currentChannel.streamUrl = line;
        channels.push({
          id: currentChannel.id || 'iptv-' + Math.random().toString(36).substring(2, 9),
          name: currentChannel.name || 'Channel ' + (channels.length + 1),
          logoUrl: currentChannel.logoUrl,
          streamUrl: line,
          category: currentChannel.category || 'General',
          currentProgram: 'Live Broadcast',
          epgDescription: 'Streaming live broadcast feed via custom IPTV playlist.',
        });
        currentChannel = null;
      }
    }
  }

  return channels;
}

export async function fetchM3UFromUrl(url: string): Promise<ChannelItem[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load playlist: ${response.statusText}`);
  }
  const text = await response.text();
  return parseM3UPlaylist(text);
}
