import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Song } from '../songs/song.interface';

@Component({
  selector: 'app-song-selection',
  templateUrl: './song-selection.component.html',
  styleUrls: ['./song-selection.component.css']
})
export class SongSelectionComponent implements OnInit {

  @Input() songList: Song[];
  @Input() currentSong: Song;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onChooseSong = new EventEmitter<Song>();

  constructor() {
    console.log(`${SongSelectionComponent.name}::ctor`);

  }

  ngOnInit() {
  }

  public handleChooseSong($event, song: Song) {
    console.log(`${SongSelectionComponent.name}::handleChooseSong song %o`, song);

    $event.preventDefault();
    this.onChooseSong.emit(song);
  }

}
