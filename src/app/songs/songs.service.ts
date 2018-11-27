import { Injectable } from '@angular/core';

import { Song } from './song.interface';

@Injectable()
export class SongsService {

  constructor() { }

  private readonly songList: Song[] = [
    {
      artist: 'Rick Astley',
      title: 'Never Gonna Give You Up',
      audio: 'assets/songs/never-gonna-give-you-up/never-gonna-give-you-up.mp3',
      lyrics: 'assets/songs/never-gonna-give-you-up/never-gonna-give-you-up.lrc',
      lyricDelay: 1,
    },
    {
      artist: 'Journey',
      title: 'Don\'t Stop Believing',
      audio: 'assets/songs/dont-stop-believing/dont-stop-believing.mp3',
      lyrics: 'assets/songs/dont-stop-believing/dont-stop-believing.lrc',
      lyricDelay: 1,
    },
    {
      artist: 'Nightcars',
      title: 'Face it',
      audio: 'assets/songs/face-it/face-it.mp3',
      lyrics: 'assets/songs/face-it/face-it.lrc',
      lyricDelay: 0,
    },
    {
      artist: 'Queen',
      title: 'Bohemian Rhapsody ',
      audio: 'assets/songs/bohemian-rhapsody/bohemian-rhapsody.mp3',
      lyrics: 'assets/songs/bohemian-rhapsody/bohemian-rhapsody.lrc',
      lyricDelay: 0,
    },
  ];

  getSongList() {
    return this.songList;
  }

}
