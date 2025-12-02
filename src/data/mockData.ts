import { Song, Playlist, Album, Artist } from '@/types/music';

// Free sample audio URLs from various sources
const sampleAudioUrls = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
];

export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Synthwave Collective',
    album: 'Digital Horizons',
    duration: 234,
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[0],
    liked: true,
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Electric Pulse',
    album: 'Night Vibes',
    duration: 198,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[1],
  },
  {
    id: '3',
    title: 'Crystal Waves',
    artist: 'Ocean Sound',
    album: 'Deep Blue',
    duration: 267,
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[2],
    liked: true,
  },
  {
    id: '4',
    title: 'Urban Echoes',
    artist: 'City Lights',
    album: 'Metropolitan',
    duration: 312,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[3],
  },
  {
    id: '5',
    title: 'Stellar Journey',
    artist: 'Cosmos',
    album: 'Interstellar',
    duration: 245,
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[4],
  },
  {
    id: '6',
    title: 'Forest Rain',
    artist: 'Nature Sounds',
    album: 'Peaceful Moments',
    duration: 289,
    coverUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[5],
    liked: true,
  },
  {
    id: '7',
    title: 'Electric Soul',
    artist: 'Synthwave Collective',
    album: 'Digital Horizons',
    duration: 221,
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[0],
  },
  {
    id: '8',
    title: 'Sunset Boulevard',
    artist: 'Retro Waves',
    album: 'Golden Hour',
    duration: 276,
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    audioUrl: sampleAudioUrls[1],
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: 'pl1',
    name: 'Chill Vibes',
    description: 'Relaxing tunes for any moment',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    songs: mockSongs.slice(0, 4),
    createdBy: 'user1',
    isPublic: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'pl2',
    name: 'Workout Mix',
    description: 'High energy tracks to keep you moving',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songs: mockSongs.slice(2, 6),
    createdBy: 'user1',
    isPublic: false,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'pl3',
    name: 'Late Night Sessions',
    description: 'Perfect for those late night coding sessions',
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&h=300&fit=crop',
    songs: mockSongs.slice(4, 8),
    createdBy: 'user1',
    isPublic: true,
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'pl4',
    name: 'Focus Mode',
    description: 'Concentration-enhancing instrumentals',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=300&fit=crop',
    songs: mockSongs.slice(0, 5),
    createdBy: 'user1',
    isPublic: true,
    createdAt: new Date('2024-03-25'),
  },
];

export const mockAlbums: Album[] = [
  {
    id: 'alb1',
    name: 'Digital Horizons',
    artist: 'Synthwave Collective',
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&h=300&fit=crop',
    releaseYear: 2024,
    songs: mockSongs.filter(s => s.album === 'Digital Horizons'),
  },
  {
    id: 'alb2',
    name: 'Night Vibes',
    artist: 'Electric Pulse',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    releaseYear: 2023,
    songs: mockSongs.filter(s => s.album === 'Night Vibes'),
  },
  {
    id: 'alb3',
    name: 'Deep Blue',
    artist: 'Ocean Sound',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    releaseYear: 2024,
    songs: mockSongs.filter(s => s.album === 'Deep Blue'),
  },
];

export const mockArtists: Artist[] = [
  {
    id: 'art1',
    name: 'Synthwave Collective',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    bio: 'Pioneers of the modern synthwave movement',
    monthlyListeners: 1250000,
    albums: mockAlbums.filter(a => a.artist === 'Synthwave Collective'),
  },
  {
    id: 'art2',
    name: 'Electric Pulse',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    bio: 'Electronic music duo from Berlin',
    monthlyListeners: 890000,
    albums: mockAlbums.filter(a => a.artist === 'Electric Pulse'),
  },
  {
    id: 'art3',
    name: 'Ocean Sound',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    bio: 'Ambient and chillout producer',
    monthlyListeners: 560000,
    albums: mockAlbums.filter(a => a.artist === 'Ocean Sound'),
  },
];

export const recentlyPlayed = mockSongs.slice(0, 6);
export const featuredPlaylists = mockPlaylists;
export const topArtists = mockArtists;
