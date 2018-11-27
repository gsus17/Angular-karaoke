import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { SongsService } from './songs/songs.service';
import { Song } from './songs/song.interface';
import './natural';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  public songList: Song[] = [];
  public currentSong: Song;

  constructor(private Songs: SongsService) {
    console.log(`${AppComponent.name}::ctor`);
  }

  ngOnInit() {
    this.songList = this.Songs.getSongList();
  }

  public handleChooseSong(song: Song) {
    console.log(`${AppComponent.name}::handleChooseSong song %o`, song);
    this.currentSong = song;
  }

  public handleClearCurrentSong() {
    console.log(`${AppComponent.name}::handleClearCurrentSong`);
    this.currentSong = null;
  }
}
