import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Song, RepeatMode, PlayerState } from '@/types/music';
import { useMusicLibrary } from './MusicLibraryContext';

interface PlayerContextType extends PlayerState {
  play: (song?: Song, songList?: Song[]) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (songs: Song[]) => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getSignedAudioUrl } = useMusicLibrary();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const nextRef = useRef<() => void>(() => {});

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextRef.current();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;
    
    try {
      // Get signed URL for the audio file
      const signedUrl = await getSignedAudioUrl(song.audioUrl);
      audioRef.current.src = signedUrl;
      audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  }, [getSignedAudioUrl]);

  const play = useCallback((song?: Song, songList?: Song[]) => {
    if (song) {
      setCurrentSong(song);
      // Se uma lista foi fornecida, use-a como queue
      if (songList && songList.length > 0) {
        setQueue(songList);
        const index = songList.findIndex(s => s.id === song.id);
        setQueueIndex(index >= 0 ? index : 0);
      } else if (queue.length === 0) {
        // Se não há queue, cria uma com apenas essa música
        setQueue([song]);
        setQueueIndex(0);
      }
      playSong(song);
    } else if (audioRef.current && currentSong) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong, queue, playSong]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setQueueIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    playSong(queue[nextIndex]);
  }, [queue, queueIndex, shuffle, repeat, playSong]);

  // Update ref for next function
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const previous = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeat === 'all' ? queue.length - 1 : 0;
    }

    setQueueIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    playSong(queue[prevIndex]);
  }, [queue, queueIndex, repeat, playSong]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((songs: Song[]) => {
    setQueue(prev => [...prev, ...songs]);
  }, []);

  const playPlaylist = useCallback((songs: Song[], startIndex = 0) => {
    setQueue(songs);
    setQueueIndex(startIndex);
    setCurrentSong(songs[startIndex]);
    playSong(songs[startIndex]);
  }, [playSong]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        volume,
        progress,
        duration,
        shuffle,
        repeat,
        queue,
        queueIndex,
        play,
        pause,
        toggle,
        next,
        previous,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        playPlaylist,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
